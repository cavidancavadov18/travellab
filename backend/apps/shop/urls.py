from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import CartView, CheckoutView, ProductViewSet, ShopOrderListView

router = DefaultRouter()
router.register("products", ProductViewSet, basename="product")

urlpatterns = router.urls + [
    path("cart/", CartView.as_view(), name="shop-cart"),
    path("checkout/", CheckoutView.as_view(), name="shop-checkout"),
    path("orders/", ShopOrderListView.as_view(), name="shop-orders"),
]
