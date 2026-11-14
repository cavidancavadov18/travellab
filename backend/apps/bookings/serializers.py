from rest_framework import serializers

from .models import Booking


class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = (
            "id",
            "booking_type",
            "status",
            "reference",
            "title",
            "details",
            "passengers",
            "quantity",
            "subtotal",
            "labpoint_redeemed",
            "labpoint_earned",
            "total",
            "currency",
            "contact_email",
            "contact_phone",
            "notes",
            "related_object_id",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "status",
            "reference",
            "labpoint_earned",
            "created_at",
            "updated_at",
        )


class BookingCreateSerializer(serializers.Serializer):
    booking_type = serializers.ChoiceField(choices=["tour", "hotel", "flight", "service", "shop"])
    title = serializers.CharField(max_length=255)
    details = serializers.DictField(required=False)
    passengers = serializers.ListField(child=serializers.DictField(), required=False)
    quantity = serializers.IntegerField(min_value=1, default=1)
    subtotal = serializers.DecimalField(max_digits=12, decimal_places=2)
    currency = serializers.CharField(max_length=3, default="USD")
    contact_email = serializers.EmailField()
    contact_phone = serializers.CharField(required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)
    related_object_id = serializers.IntegerField(required=False, allow_null=True)
    labpoint_to_redeem = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, default=0)
    pay_now = serializers.BooleanField(default=True)
