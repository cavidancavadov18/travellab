from django.contrib import admin

from .models import Destination, Hotel, Service, Tour


@admin.register(Destination)
class DestinationAdmin(admin.ModelAdmin):
    list_display = ("name", "country", "is_popular", "is_active")
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name", "country")


@admin.register(Tour)
class TourAdmin(admin.ModelAdmin):
    list_display = ("title", "destination", "price", "category", "is_featured", "is_active")
    list_filter = ("category", "is_featured", "is_active")
    prepopulated_fields = {"slug": ("title",)}
    search_fields = ("title",)


@admin.register(Hotel)
class HotelAdmin(admin.ModelAdmin):
    list_display = ("name", "destination", "stars", "price_from", "is_featured", "is_active")
    list_filter = ("stars", "is_featured", "is_active", "destination")
    search_fields = ("name", "destination__name", "address")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ("title", "service_type", "price_from", "is_active", "sort_order")
    list_filter = ("service_type", "is_active")
    search_fields = ("title", "description")
    prepopulated_fields = {"slug": ("title",)}
