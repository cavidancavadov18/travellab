from django.db import models


class Destination(models.Model):
    name = models.CharField(max_length=120)
    name_en = models.CharField(max_length=120, blank=True)
    name_ru = models.CharField(max_length=120, blank=True)
    slug = models.SlugField(unique=True)
    country = models.CharField(max_length=100)
    country_code = models.CharField(max_length=3, blank=True)
    region = models.CharField(max_length=100, blank=True)
    short_description = models.TextField(blank=True)
    description = models.TextField(blank=True)
    image_url = models.URLField(max_length=500)
    is_popular = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Tour(models.Model):
    CATEGORY_CHOICES = (
        ("all", "All"),
        ("group", "Group"),
        ("honeymoon", "Honeymoon"),
        ("europe", "Europe"),
        ("asia", "Asia"),
        ("turkey", "Turkey"),
        ("sports", "Sports"),
        ("concert", "Concert"),
        ("premium", "Premium"),
    )

    destination = models.ForeignKey(Destination, on_delete=models.CASCADE, related_name="tours")
    title = models.CharField(max_length=200)
    title_en = models.CharField(max_length=200, blank=True)
    title_ru = models.CharField(max_length=200, blank=True)
    slug = models.SlugField(unique=True)
    summary = models.TextField(blank=True)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=32, choices=CATEGORY_CHOICES, default="premium")
    duration_days = models.PositiveIntegerField(default=5)
    duration_nights = models.PositiveIntegerField(default=4)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default="USD")
    price_azn = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    labpoint_earn = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    image_url = models.URLField(max_length=500)
    gallery = models.JSONField(default=list, blank=True)
    itinerary = models.JSONField(default=list, blank=True)
    includes = models.JSONField(default=list, blank=True)
    excludes = models.JSONField(default=list, blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    seats_left = models.PositiveIntegerField(default=10)
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=4.8)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-is_featured", "-created_at"]

    def __str__(self):
        return self.title


class Hotel(models.Model):
    destination = models.ForeignKey(Destination, on_delete=models.CASCADE, related_name="hotels")
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    stars = models.PositiveSmallIntegerField(default=4)
    address = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    amenities = models.JSONField(default=list, blank=True)
    image_url = models.URLField(max_length=500)
    gallery = models.JSONField(default=list, blank=True)
    price_from = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default="USD")
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=4.5)
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-is_featured", "name"]

    def __str__(self):
        return self.name


class Service(models.Model):
    TYPE_CHOICES = (
        ("visa", "Visa"),
        ("transfer", "Transfer"),
        ("insurance", "Insurance"),
        ("gift_card", "Gift Card"),
        ("corporate", "Corporate"),
        ("other", "Other"),
    )

    title = models.CharField(max_length=200)
    title_en = models.CharField(max_length=200, blank=True)
    title_ru = models.CharField(max_length=200, blank=True)
    slug = models.SlugField(unique=True)
    service_type = models.CharField(max_length=32, choices=TYPE_CHOICES)
    summary = models.TextField(blank=True)
    description = models.TextField(blank=True)
    price_from = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=3, default="AZN")
    image_url = models.URLField(max_length=500, blank=True)
    features = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "title"]

    def __str__(self):
        return self.title
