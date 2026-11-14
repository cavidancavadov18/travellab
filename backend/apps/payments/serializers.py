from rest_framework import serializers

from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = "__all__"
        read_only_fields = ("id", "user", "provider", "status", "provider_ref", "created_at", "updated_at")


class PaymentCreateSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    currency = serializers.CharField(max_length=3, default="USD")
    booking_reference = serializers.CharField(required=False, allow_blank=True)
    shop_order_reference = serializers.CharField(required=False, allow_blank=True)


class PaymentConfirmSerializer(serializers.Serializer):
    provider_ref = serializers.CharField()
