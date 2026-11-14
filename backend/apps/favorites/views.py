from django.contrib.contenttypes.models import ContentType
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.catalog.models import Hotel, Tour
from apps.shop.models import Product

from .models import Favorite
from .serializers import FavoriteSerializer, FavoriteToggleSerializer

TYPE_MAP = {
    "tour": Tour,
    "hotel": Hotel,
    "product": Product,
}


class FavoriteListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        qs = Favorite.objects.filter(user=request.user).select_related("content_type")
        return Response(FavoriteSerializer(qs, many=True).data)


class FavoriteToggleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = FavoriteToggleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        model = TYPE_MAP[serializer.validated_data["object_type"]]
        object_id = serializer.validated_data["object_id"]
        if not model.objects.filter(id=object_id).exists():
            return Response({"detail": "Object not found"}, status=status.HTTP_404_NOT_FOUND)
        ct = ContentType.objects.get_for_model(model)
        fav = Favorite.objects.filter(user=request.user, content_type=ct, object_id=object_id).first()
        if fav:
            fav.delete()
            return Response({"favorited": False})
        Favorite.objects.create(user=request.user, content_type=ct, object_id=object_id)
        return Response({"favorited": True}, status=status.HTTP_201_CREATED)
