from django.contrib.contenttypes.models import ContentType
from rest_framework import serializers

from apps.catalog.models import Hotel, Tour
from apps.catalog.serializers import HotelSerializer, TourListSerializer
from apps.shop.models import Product
from apps.shop.serializers import ProductSerializer

from .models import Favorite


class FavoriteSerializer(serializers.ModelSerializer):
    object_type = serializers.SerializerMethodField()
    object_data = serializers.SerializerMethodField()

    class Meta:
        model = Favorite
        fields = ("id", "object_type", "object_id", "object_data", "created_at")

    def get_object_type(self, obj):
        return obj.content_type.model

    def get_object_data(self, obj):
        target = obj.content_object
        if isinstance(target, Tour):
            return TourListSerializer(target).data
        if isinstance(target, Hotel):
            return HotelSerializer(target).data
        if isinstance(target, Product):
            return ProductSerializer(target).data
        return {"id": obj.object_id}


class FavoriteToggleSerializer(serializers.Serializer):
    object_type = serializers.ChoiceField(choices=["tour", "hotel", "product"])
    object_id = serializers.IntegerField()
