from django.conf import settings
from django.db import models


class LabpointWallet(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="labpoint_wallet")
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    lifetime_earned = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    lifetime_redeemed = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email}: {self.balance}"


class LabpointTransaction(models.Model):
    TYPE_CHOICES = (
        ("earn", "Earn"),
        ("redeem", "Redeem"),
        ("adjust", "Adjust"),
    )

    wallet = models.ForeignKey(LabpointWallet, on_delete=models.CASCADE, related_name="transactions")
    tx_type = models.CharField(max_length=16, choices=TYPE_CHOICES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    balance_after = models.DecimalField(max_digits=12, decimal_places=2)
    description = models.CharField(max_length=255, blank=True)
    booking_reference = models.CharField(max_length=32, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.tx_type} {self.amount}"
