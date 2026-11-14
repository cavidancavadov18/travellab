from django.contrib import admin

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


@admin.register(TravelPlan)
class TravelPlanAdmin(admin.ModelAdmin):
    list_display = ("title", "destination", "days", "budget", "user", "created_at")
    search_fields = ("title", "destination")


@admin.register(ExploreCountry)
class ExploreCountryAdmin(admin.ModelAdmin):
    list_display = ("name", "name_az", "region", "capital", "is_featured")
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name", "name_az", "capital")


@admin.register(BudgetEstimate)
class BudgetEstimateAdmin(admin.ModelAdmin):
    list_display = ("destination", "days", "travelers", "style", "total", "created_at")


@admin.register(Comparison)
class ComparisonAdmin(admin.ModelAdmin):
    list_display = ("object_type", "user", "created_at")


@admin.register(Venue360)
class Venue360Admin(admin.ModelAdmin):
    list_display = ("title", "country", "location", "is_active")
    prepopulated_fields = {"slug": ("title",)}


class TripItemInline(admin.TabularInline):
    model = TripItem
    extra = 0


@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = ("title", "user", "destination", "status", "updated_at")
    inlines = [TripItemInline]


@admin.register(SmartDeal)
class SmartDealAdmin(admin.ModelAdmin):
    list_display = ("title", "destination", "discount_percent", "price_from", "is_active", "score")
    prepopulated_fields = {"slug": ("title",)}


class AssistantMessageInline(admin.TabularInline):
    model = AssistantMessage
    extra = 0


@admin.register(AssistantThread)
class AssistantThreadAdmin(admin.ModelAdmin):
    list_display = ("title", "user", "updated_at")
    inlines = [AssistantMessageInline]


@admin.register(WishlistItem)
class WishlistItemAdmin(admin.ModelAdmin):
    list_display = ("title", "kind", "user", "created_at")
