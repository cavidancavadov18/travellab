from django.contrib import admin

from .models import Airport, FlightRoute


@admin.register(Airport)
class AirportAdmin(admin.ModelAdmin):
    list_display = ("code", "city", "country", "name")
    search_fields = ("code", "city", "name")


@admin.register(FlightRoute)
class FlightRouteAdmin(admin.ModelAdmin):
    list_display = ("origin", "destination", "airline", "base_price", "is_active")
    list_filter = ("is_active",)
