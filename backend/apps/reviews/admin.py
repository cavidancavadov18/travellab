from django.contrib import admin

from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("author_name", "rating", "source", "is_featured", "is_active")
    list_filter = ("is_featured", "author_locale")
