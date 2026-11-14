from rest_framework import permissions, status, viewsets
from rest_framework.response import Response

from .models import Booking
from .serializers import BookingCreateSerializer, BookingSerializer
from .services import create_booking


class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "post", "head", "options"]

    def get_queryset(self):
        qs = Booking.objects.filter(user=self.request.user)
        if self.request.user.is_staff and self.request.query_params.get("all") == "1":
            qs = Booking.objects.all().select_related("user")
        return qs

    def create(self, request, *args, **kwargs):
        serializer = BookingCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            booking = create_booking(request.user, serializer.validated_data)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(BookingSerializer(booking).data, status=status.HTTP_201_CREATED)
