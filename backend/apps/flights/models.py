from django.db import models


class Airport(models.Model):
    code = models.CharField(max_length=3, unique=True)
    city = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    name = models.CharField(max_length=200)

    def __str__(self):
        return f"{self.code} — {self.city}"


class FlightRoute(models.Model):
    """Seeded demo routes used by the mock search generator."""

    origin = models.ForeignKey(Airport, on_delete=models.CASCADE, related_name="outbound_routes")
    destination = models.ForeignKey(Airport, on_delete=models.CASCADE, related_name="inbound_routes")
    airline = models.CharField(max_length=100)
    airline_code = models.CharField(max_length=8)
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default="USD")
    duration_minutes = models.PositiveIntegerField(default=180)
    stops = models.PositiveSmallIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ("origin", "destination", "airline_code")

    def __str__(self):
        return f"{self.origin.code}->{self.destination.code} {self.airline_code}"
