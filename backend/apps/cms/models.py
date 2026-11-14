from django.db import models


class Partner(models.Model):
    name = models.CharField(max_length=120)
    logo_url = models.URLField(max_length=500, blank=True)
    website = models.URLField(max_length=500, blank=True)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "name"]

    def __str__(self):
        return self.name


class ContactMessage(models.Model):
    name = models.CharField(max_length=120)
    email = models.EmailField()
    phone = models.CharField(max_length=32, blank=True)
    subject = models.CharField(max_length=200, blank=True)
    message = models.TextField()
    source = models.CharField(max_length=64, blank=True, default="contact")
    is_handled = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name}: {self.subject or 'message'}"
