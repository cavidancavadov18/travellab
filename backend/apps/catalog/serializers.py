from rest_framework import serializers

from .models import Destination, Hotel, Service, Tour


class DestinationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Destination
        fields = "__all__"


class TourListSerializer(serializers.ModelSerializer):
    destination_name = serializers.CharField(source="destination.name", read_only=True)
    destination_slug = serializers.CharField(source="destination.slug", read_only=True)

    class Meta:
        model = Tour
        fields = (
            "id",
            "title",
            "title_en",
            "title_ru",
            "slug",
            "summary",
            "category",
            "duration_days",
            "duration_nights",
            "price",
            "currency",
            "price_azn",
            "labpoint_earn",
            "image_url",
            "start_date",
            "end_date",
            "seats_left",
            "is_featured",
            "rating",
            "destination_name",
            "destination_slug",
        )


class TourDetailSerializer(TourListSerializer):
    destination = DestinationSerializer(read_only=True)

    class Meta(TourListSerializer.Meta):
        fields = TourListSerializer.Meta.fields + (
            "description",
            "gallery",
            "itinerary",
            "includes",
            "excludes",
            "destination",
            "created_at",
            "updated_at",
        )


class HotelSerializer(serializers.ModelSerializer):
    destination_name = serializers.CharField(source="destination.name", read_only=True)

    class Meta:
        model = Hotel
        fields = "__all__"


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = "__all__"
