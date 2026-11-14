from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAdminUser

from .models import Review
from .serializers import ReviewSerializer


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.filter(is_active=True)
    serializer_class = ReviewSerializer
    filterset_fields = ["is_featured", "author_locale"]
    ordering_fields = ["created_at", "rating"]

    def get_permissions(self):
        # Demo: public can submit reviews; only staff can edit/delete.
        if self.action in ("update", "partial_update", "destroy"):
            return [IsAdminUser()]
        return [AllowAny()]
