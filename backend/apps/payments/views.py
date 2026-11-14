from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Payment
from .providers import get_payment_provider
from .serializers import PaymentConfirmSerializer, PaymentCreateSerializer, PaymentSerializer


class PaymentCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = PaymentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        provider = get_payment_provider()
        result = provider.create_payment(
            serializer.validated_data["amount"],
            serializer.validated_data.get("currency") or "USD",
            {
                "booking_reference": serializer.validated_data.get("booking_reference") or "",
                "shop_order_reference": serializer.validated_data.get("shop_order_reference") or "",
            },
        )
        payment = Payment.objects.create(
            user=request.user,
            booking_reference=serializer.validated_data.get("booking_reference") or "",
            shop_order_reference=serializer.validated_data.get("shop_order_reference") or "",
            provider=provider.name,
            status=result.status,
            amount=serializer.validated_data["amount"],
            currency=serializer.validated_data.get("currency") or "USD",
            provider_ref=result.provider_ref,
            meta=result.raw or {},
        )
        return Response(PaymentSerializer(payment).data, status=status.HTTP_201_CREATED)


class PaymentConfirmView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = PaymentConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            payment = Payment.objects.get(user=request.user, provider_ref=serializer.validated_data["provider_ref"])
        except Payment.DoesNotExist:
            return Response({"detail": "Payment not found"}, status=status.HTTP_404_NOT_FOUND)
        provider = get_payment_provider()
        result = provider.confirm_payment(payment.provider_ref)
        payment.status = result.status if result.success else "failed"
        payment.save(update_fields=["status", "updated_at"])
        if result.success:
            if payment.booking_reference:
                from apps.bookings.models import Booking

                Booking.objects.filter(reference=payment.booking_reference, user=request.user).exclude(
                    status="cancelled"
                ).update(status="paid")
            if payment.shop_order_reference:
                from apps.shop.models import ShopOrder

                ShopOrder.objects.filter(reference=payment.shop_order_reference, user=request.user).exclude(
                    status="cancelled"
                ).update(status="paid")
        return Response(PaymentSerializer(payment).data)
