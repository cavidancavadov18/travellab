from django_filters import rest_framework as filters
from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAdminUser

from .models import Destination, Hotel, Service, Tour
from .serializers import (
    DestinationSerializer,
    HotelSerializer,
    ServiceSerializer,
    TourDetailSerializer,
    TourListSerializer,
)


class TourFilter(filters.FilterSet):
    category = filters.CharFilter(field_name="category")
    destination = filters.CharFilter(field_name="destination__slug")
    min_price = filters.NumberFilter(field_name="price", lookup_expr="gte")
    max_price = filters.NumberFilter(field_name="price", lookup_expr="lte")
    featured = filters.BooleanFilter(field_name="is_featured")

    class Meta:
        model = Tour
        fields = ["category", "destination", "featured"]


class ReadWriteMixin:
    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [IsAdminUser()]
        return [AllowAny()]


class DestinationViewSet(ReadWriteMixin, viewsets.ModelViewSet):
    queryset = Destination.objects.filter(is_active=True)
    serializer_class = DestinationSerializer
    lookup_field = "slug"
    filterset_fields = ["is_popular", "country_code"]
    search_fields = ["name", "country", "region"]
    ordering_fields = ["name", "created_at"]


class TourViewSet(ReadWriteMixin, viewsets.ModelViewSet):
    queryset = Tour.objects.filter(is_active=True).select_related("destination")
    lookup_field = "slug"
    filterset_class = TourFilter
    search_fields = ["title", "summary", "destination__name"]
    ordering_fields = ["price", "start_date", "created_at", "rating"]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return TourDetailSerializer
        return TourListSerializer


class HotelViewSet(ReadWriteMixin, viewsets.ModelViewSet):
    queryset = Hotel.objects.filter(is_active=True).select_related("destination")
    serializer_class = HotelSerializer
    lookup_field = "slug"
    filterset_fields = ["destination__slug", "stars", "is_featured"]
    search_fields = ["name", "destination__name", "address"]
    ordering_fields = ["price_from", "stars", "rating", "name"]


class ServiceViewSet(ReadWriteMixin, viewsets.ModelViewSet):
    queryset = Service.objects.filter(is_active=True)
    serializer_class = ServiceSerializer
    lookup_field = "slug"
    filterset_fields = ["service_type"]
    search_fields = ["title", "summary"]
