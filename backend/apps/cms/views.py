from rest_framework import permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ContactMessage, Partner
from .serializers import ContactMessageSerializer, PartnerSerializer


class PartnerViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Partner.objects.filter(is_active=True)
    serializer_class = PartnerSerializer
    permission_classes = [permissions.AllowAny]


class ContactCreateView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ContactMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"success": True, "message": "Message received"}, status=status.HTTP_201_CREATED)


class AdminStatsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        from apps.bookings.models import Booking
        from apps.catalog.models import Hotel, Tour
        from apps.shop.models import ShopOrder
        from django.contrib.auth import get_user_model

        from apps.payments.models import Payment
        from apps.shop.models import Product
        from django.db.models import Sum

        User = get_user_model()
        paid_bookings = Booking.objects.filter(status="paid")
        paid_orders = ShopOrder.objects.filter(status="paid")
        return Response(
            {
                "users": User.objects.count(),
                "tours": Tour.objects.count(),
                "hotels": Hotel.objects.count(),
                "products": Product.objects.filter(is_active=True).count(),
                "bookings": Booking.objects.count(),
                "bookings_paid": paid_bookings.count(),
                "shop_orders": ShopOrder.objects.count(),
                "shop_orders_paid": paid_orders.count(),
                "payments_succeeded": Payment.objects.filter(status="succeeded").count(),
                "revenue_bookings": str(paid_bookings.aggregate(s=Sum("total"))["s"] or 0),
                "revenue_shop": str(paid_orders.aggregate(s=Sum("total"))["s"] or 0),
                "contact_messages": ContactMessage.objects.filter(is_handled=False).count(),
            }
        )
