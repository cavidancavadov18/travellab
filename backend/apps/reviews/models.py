from django.db import models


class Review(models.Model):
    author_name = models.CharField(max_length=120)
    author_locale = models.CharField(max_length=5, default="az")
    rating = models.PositiveSmallIntegerField(default=5)
    body = models.TextField()
    source = models.CharField(max_length=64, blank=True, default="Google")
    is_featured = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-is_featured", "-created_at"]

    def __str__(self):
        return f"{self.author_name} ({self.rating})"
