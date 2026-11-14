from rest_framework import serializers

from .models import (
    AssistantMessage,
    AssistantThread,
    BudgetEstimate,
    Comparison,
    ExploreCountry,
    SmartDeal,
    TravelPlan,
    Trip,
    TripItem,
    Venue360,
    WishlistItem,
)


class TravelPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = TravelPlan
        fields = "__all__"
        read_only_fields = ("user", "itinerary", "estimated_total", "demo", "created_at", "title")


class TravelPlanCreateSerializer(serializers.Serializer):
    destination = serializers.CharField(max_length=120)
    origin = serializers.CharField(max_length=120, required=False, default="Bakı")
    days = serializers.IntegerField(min_value=2, max_value=14, default=5)
    budget = serializers.DecimalField(max_digits=12, decimal_places=2, default=1000)
    currency = serializers.CharField(max_length=3, default="USD")
    travelers = serializers.IntegerField(min_value=1, max_value=12, default=2)
    interests = serializers.ListField(child=serializers.CharField(max_length=64), required=False, default=list)
    preferences = serializers.CharField(required=False, allow_blank=True, default="")


class ExploreCountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = ExploreCountry
        fields = "__all__"


class BudgetEstimateSerializer(serializers.ModelSerializer):
    class Meta:
        model = BudgetEstimate
        fields = "__all__"
        read_only_fields = (
            "user",
            "flight_cost",
            "hotel_cost",
            "food_cost",
            "activities_cost",
            "transfer_cost",
            "insurance_cost",
            "total",
            "breakdown",
            "demo",
            "created_at",
        )


class BudgetCreateSerializer(serializers.Serializer):
    destination = serializers.CharField(max_length=120)
    days = serializers.IntegerField(min_value=1, max_value=30, default=5)
    travelers = serializers.IntegerField(min_value=1, max_value=12, default=2)
    style = serializers.ChoiceField(choices=["budget", "comfort", "luxury"], default="comfort")


class ComparisonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comparison
        fields = "__all__"
        read_only_fields = ("user", "items_snapshot", "created_at")


class ComparisonCreateSerializer(serializers.Serializer):
    object_type = serializers.ChoiceField(choices=["tour", "hotel"])
    item_ids = serializers.ListField(child=serializers.IntegerField(), min_length=2, max_length=4)
    notes = serializers.CharField(required=False, allow_blank=True, default="")


class Venue360Serializer(serializers.ModelSerializer):
    class Meta:
        model = Venue360
        fields = "__all__"


class TripItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = TripItem
        fields = "__all__"
        read_only_fields = ("trip",)


class TripSerializer(serializers.ModelSerializer):
    items = TripItemSerializer(many=True, read_only=True)

    class Meta:
        model = Trip
        fields = "__all__"
        read_only_fields = ("user", "created_at", "updated_at")


class TripItemCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TripItem
        exclude = ("trip",)


class SmartDealSerializer(serializers.ModelSerializer):
    class Meta:
        model = SmartDeal
        fields = "__all__"


class AssistantMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssistantMessage
        fields = "__all__"


class AssistantThreadSerializer(serializers.ModelSerializer):
    messages = AssistantMessageSerializer(many=True, read_only=True)

    class Meta:
        model = AssistantThread
        fields = "__all__"
        read_only_fields = ("user", "created_at", "updated_at")


class AssistantChatSerializer(serializers.Serializer):
    message = serializers.CharField()
    thread_id = serializers.IntegerField(required=False)
    session_key = serializers.CharField(required=False, allow_blank=True, default="")


class WishlistItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = WishlistItem
        fields = "__all__"
        read_only_fields = ("user", "created_at")
