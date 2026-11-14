from django.urls import path

from .views import PaymentConfirmView, PaymentCreateView

urlpatterns = [
    path("create/", PaymentCreateView.as_view(), name="payment-create"),
    path("confirm/", PaymentConfirmView.as_view(), name="payment-confirm"),
]
