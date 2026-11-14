from django.conf import settings
from django.db import models


class Payment(models.Model):
    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("processing", "Processing"),
        ("succeeded", "Succeeded"),
        ("failed", "Failed"),
        ("cancelled", "Cancelled"),
    )
    PROVIDER_CHOICES = (
        ("demo", "Demo"),
        ("stripe", "Stripe"),
        ("kapital", "Kapital Bank"),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="payments")
    booking_reference = models.CharField(max_length=32, blank=True)
    shop_order_reference = models.CharField(max_length=32, blank=True)
    provider = models.CharField(max_length=32, choices=PROVIDER_CHOICES, default="demo")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default="USD")
    provider_ref = models.CharField(max_length=100, blank=True)
    meta = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Payment {self.id} {self.status}"
