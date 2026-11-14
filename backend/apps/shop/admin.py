from django.contrib import admin

from .models import Cart, CartItem, Product, ShopOrder


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "price", "stock", "is_featured", "is_active")
    list_filter = ("category", "is_featured", "is_active")
    search_fields = ("name", "description", "category")
    prepopulated_fields = {"slug": ("name",)}


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ("user", "updated_at")
    inlines = [CartItemInline]


@admin.register(ShopOrder)
class ShopOrderAdmin(admin.ModelAdmin):
    list_display = ("reference", "user", "status", "total", "created_at")
    list_filter = ("status",)
