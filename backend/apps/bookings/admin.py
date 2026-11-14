from django.contrib import admin

from .models import Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ("reference", "user", "booking_type", "status", "total", "currency", "created_at")
    list_filter = ("booking_type", "status")
    search_fields = ("reference", "user__email", "title")
