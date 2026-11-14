from django.conf import settings
from django.db import models


class Booking(models.Model):
    TYPE_CHOICES = (
        ("tour", "Tour"),
        ("hotel", "Hotel"),
        ("flight", "Flight"),
        ("service", "Service"),
        ("shop", "Shop"),
    )
    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("confirmed", "Confirmed"),
        ("paid", "Paid"),
        ("cancelled", "Cancelled"),
        ("failed", "Failed"),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="bookings")
    booking_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    reference = models.CharField(max_length=32, unique=True)
    title = models.CharField(max_length=255)
    details = models.JSONField(default=dict, blank=True)
    passengers = models.JSONField(default=list, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    labpoint_redeemed = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    labpoint_earned = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default="USD")
    contact_email = models.EmailField()
    contact_phone = models.CharField(max_length=32, blank=True)
    notes = models.TextField(blank=True)
    related_object_id = models.PositiveIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.reference} ({self.booking_type})"
