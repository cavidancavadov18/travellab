from rest_framework import serializers

from .models import Cart, CartItem, Product, ShopOrder


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = "__all__"


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(is_active=True),
        source="product",
        write_only=True,
    )

    class Meta:
        model = CartItem
        fields = ("id", "product", "product_id", "quantity")


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ("id", "items", "subtotal", "updated_at")

    def get_subtotal(self, obj):
        total = sum((item.product.price * item.quantity for item in obj.items.select_related("product")), start=0)
        return str(total)


class ShopOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShopOrder
        fields = "__all__"
        read_only_fields = ("id", "user", "reference", "status", "items", "subtotal", "total", "created_at")
