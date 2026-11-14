import uuid
from decimal import Decimal

from django.db import transaction
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.payments.models import Payment
from apps.payments.providers import get_payment_provider

from .models import Cart, CartItem, Product, ShopOrder
from .serializers import CartSerializer, ProductSerializer, ShopOrderSerializer


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    lookup_field = "slug"
    filterset_fields = ["category", "is_featured"]
    search_fields = ["name", "description"]
    ordering_fields = ["price", "name", "created_at"]


class CartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def _cart(self, user):
        cart, _ = Cart.objects.get_or_create(user=user)
        return cart

    def get(self, request):
        return Response(CartSerializer(self._cart(request.user)).data)

    def post(self, request):
        product_id = request.data.get("product_id")
        quantity = int(request.data.get("quantity") or 1)
        try:
            product = Product.objects.get(id=product_id, is_active=True)
        except Product.DoesNotExist:
            return Response({"detail": "Product not found"}, status=status.HTTP_404_NOT_FOUND)
        cart = self._cart(request.user)
        item, created = CartItem.objects.get_or_create(cart=cart, product=product, defaults={"quantity": quantity})
        if not created:
            item.quantity += quantity
            item.save(update_fields=["quantity"])
        return Response(CartSerializer(cart).data)

    def patch(self, request):
        item_id = request.data.get("item_id")
        quantity = int(request.data.get("quantity") or 1)
        cart = self._cart(request.user)
        try:
            item = cart.items.get(id=item_id)
        except CartItem.DoesNotExist:
            return Response({"detail": "Item not found"}, status=status.HTTP_404_NOT_FOUND)
        if quantity <= 0:
            item.delete()
        else:
            item.quantity = quantity
            item.save(update_fields=["quantity"])
        return Response(CartSerializer(cart).data)

    def delete(self, request):
        item_id = request.query_params.get("item_id")
        cart = self._cart(request.user)
        if item_id:
            cart.items.filter(id=item_id).delete()
        else:
            cart.items.all().delete()
        return Response(CartSerializer(cart).data)


class CheckoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        items = list(cart.items.select_related("product"))
        if not items:
            return Response({"detail": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)

        payload_items = []
        subtotal = Decimal("0")
        for item in items:
            if item.quantity > item.product.stock:
                return Response(
                    {"detail": f"Insufficient stock for {item.product.name}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            line = item.product.price * item.quantity
            subtotal += line
            payload_items.append(
                {
                    "product_id": item.product_id,
                    "name": item.product.name,
                    "quantity": item.quantity,
                    "price": str(item.product.price),
                    "line_total": str(line),
                }
            )

        reference = f"SH{uuid.uuid4().hex[:10].upper()}"
        order = ShopOrder.objects.create(
            user=request.user,
            reference=reference,
            status="pending",
            items=payload_items,
            subtotal=subtotal,
            total=subtotal,
            currency="AZN",
            shipping_address=request.data.get("shipping_address") or "",
        )

        provider = get_payment_provider()
        created = provider.create_payment(subtotal, "AZN", {"shop_order": reference})
        payment = Payment.objects.create(
            user=request.user,
            shop_order_reference=reference,
            provider=provider.name,
            status="processing",
            amount=subtotal,
            currency="AZN",
            provider_ref=created.provider_ref,
            meta=created.raw or {},
        )
        confirmed = provider.confirm_payment(created.provider_ref)
        if confirmed.success:
            payment.status = "succeeded"
            payment.save(update_fields=["status", "updated_at"])
            order.status = "paid"
            order.save(update_fields=["status"])
            for item in items:
                product = item.product
                product.stock = max(0, product.stock - item.quantity)
                product.save(update_fields=["stock"])
            cart.items.all().delete()

        return Response(ShopOrderSerializer(order).data, status=status.HTTP_201_CREATED)


class ShopOrderListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        qs = ShopOrder.objects.filter(user=request.user)
        return Response(ShopOrderSerializer(qs, many=True).data)
