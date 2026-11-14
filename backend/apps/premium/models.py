from django.conf import settings
from django.db import models


class TravelPlan(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="travel_plans")
    title = models.CharField(max_length=200)
    origin = models.CharField(max_length=120, default="Bakı")
    destination = models.CharField(max_length=120)
    days = models.PositiveSmallIntegerField(default=5)
    budget = models.DecimalField(max_digits=12, decimal_places=2, default=1000)
    currency = models.CharField(max_length=3, default="USD")
    travelers = models.PositiveSmallIntegerField(default=2)
    interests = models.JSONField(default=list, blank=True)
    preferences = models.TextField(blank=True)
    itinerary = models.JSONField(default=list, blank=True)
    estimated_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    demo = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class ExploreCountry(models.Model):
    name = models.CharField(max_length=120)
    name_az = models.CharField(max_length=120, blank=True)
    slug = models.SlugField(unique=True)
    region = models.CharField(max_length=64, blank=True)
    capital = models.CharField(max_length=120, blank=True)
    lat = models.FloatField()
    lng = models.FloatField()
    summary = models.TextField(blank=True)
    best_season = models.CharField(max_length=120, blank=True)
    avg_flight_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default="USD")
    image_url = models.CharField(max_length=500, blank=True)
    highlights = models.JSONField(default=list, blank=True)
    is_featured = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "name"]

    def __str__(self):
        return self.name_az or self.name


class BudgetEstimate(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="budget_estimates")
    destination = models.CharField(max_length=120)
    days = models.PositiveSmallIntegerField(default=5)
    travelers = models.PositiveSmallIntegerField(default=2)
    style = models.CharField(max_length=32, default="comfort")  # budget|comfort|luxury
    flight_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    hotel_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    food_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    activities_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    transfer_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    insurance_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default="USD")
    breakdown = models.JSONField(default=dict, blank=True)
    demo = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]


class Comparison(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="comparisons")
    object_type = models.CharField(max_length=20)  # tour|hotel
    item_ids = models.JSONField(default=list)
    items_snapshot = models.JSONField(default=list, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]


class Venue360(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    location = models.CharField(max_length=200, blank=True)
    country = models.CharField(max_length=120, blank=True)
    description = models.TextField(blank=True)
    cover_image = models.CharField(max_length=500, blank=True)
    panorama_url = models.CharField(max_length=500, blank=True)
    hotspots = models.JSONField(default=list, blank=True)
    related_tour_slug = models.CharField(max_length=200, blank=True)
    related_hotel_slug = models.CharField(max_length=200, blank=True)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "title"]
        verbose_name = "360 Venue"

    def __str__(self):
        return self.title


class Trip(models.Model):
    STATUS = (
        ("draft", "Draft"),
        ("planned", "Planned"),
        ("active", "Active"),
        ("completed", "Completed"),
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="trips")
    title = models.CharField(max_length=200)
    destination = models.CharField(max_length=120, blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS, default="draft")
    budget = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default="USD")
    notes = models.TextField(blank=True)
    cover_image = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return self.title


class TripItem(models.Model):
    KIND = (
        ("flight", "Flight"),
        ("hotel", "Hotel"),
        ("tour", "Tour"),
        ("activity", "Activity"),
        ("transfer", "Transfer"),
        ("note", "Note"),
    )
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name="items")
    kind = models.CharField(max_length=20, choices=KIND, default="activity")
    title = models.CharField(max_length=200)
    day_number = models.PositiveSmallIntegerField(default=1)
    start_time = models.CharField(max_length=16, blank=True)
    cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default="USD")
    meta = models.JSONField(default=dict, blank=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["day_number", "sort_order", "id"]


class SmartDeal(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    summary = models.TextField(blank=True)
    destination = models.CharField(max_length=120, blank=True)
    discount_percent = models.PositiveSmallIntegerField(default=10)
    price_from = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default="USD")
    image_url = models.CharField(max_length=500, blank=True)
    tags = models.JSONField(default=list, blank=True)
    valid_until = models.DateField(null=True, blank=True)
    cta_href = models.CharField(max_length=300, blank=True)
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=True)
    score = models.PositiveIntegerField(default=50)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-is_featured", "-score", "-created_at"]

    def __str__(self):
        return self.title


class AssistantThread(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="assistant_threads")
    session_key = models.CharField(max_length=64, blank=True, db_index=True)
    title = models.CharField(max_length=200, default="AI Travel Assistant")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]


class AssistantMessage(models.Model):
    ROLE = (("user", "User"), ("assistant", "Assistant"), ("system", "System"))
    thread = models.ForeignKey(AssistantThread, on_delete=models.CASCADE, related_name="messages")
    role = models.CharField(max_length=16, choices=ROLE)
    content = models.TextField()
    meta = models.JSONField(default=dict, blank=True)
    demo = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]


class WishlistItem(models.Model):
    KIND = (
        ("destination", "Destination"),
        ("tour", "Tour"),
        ("hotel", "Hotel"),
        ("country", "Country"),
        ("deal", "Deal"),
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="wishlist_items")
    kind = models.CharField(max_length=20, choices=KIND)
    title = models.CharField(max_length=200)
    slug = models.CharField(max_length=200, blank=True)
    image_url = models.CharField(max_length=500, blank=True)
    price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=3, default="USD")
    href = models.CharField(max_length=300, blank=True)
    meta = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        unique_together = ("user", "kind", "slug", "title")

    def __str__(self):
        return f"{self.user_id}:{self.title}"
