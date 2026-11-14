from django.contrib import admin

from .models import ContactMessage, Partner


@admin.register(Partner)
class PartnerAdmin(admin.ModelAdmin):
    list_display = ("name", "is_active", "sort_order")


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "subject", "source", "is_handled", "created_at")
    list_filter = ("is_handled", "source")
