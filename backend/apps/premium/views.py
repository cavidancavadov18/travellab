from django.db.models import Sum
from rest_framework import permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.bookings.models import Booking
from apps.catalog.models import Hotel, Tour
from apps.favorites.models import Favorite
from apps.labpoint.models import LabpointWallet

from .models import (
    AssistantMessage,
    AssistantThread,
    BudgetEstimate,
    Comparison,
    ExploreCountry,
    SmartDeal,
    TravelPlan,
    Trip,
    TripItem,
    Venue360,
    WishlistItem,
)
from .serializers import (
    AssistantChatSerializer,
    AssistantThreadSerializer,
    BudgetCreateSerializer,
    BudgetEstimateSerializer,
    ComparisonCreateSerializer,
    ComparisonSerializer,
    ExploreCountrySerializer,
    SmartDealSerializer,
    TravelPlanCreateSerializer,
    TravelPlanSerializer,
    TripItemCreateSerializer,
    TripItemSerializer,
    TripSerializer,
    Venue360Serializer,
    WishlistItemSerializer,
)
from .services import assistant_reply, calculate_budget, generate_travel_plan


class TravelPlanViewSet(viewsets.ModelViewSet):
    serializer_class = TravelPlanSerializer
    http_method_names = ["get", "post", "head", "options"]

    def get_permissions(self):
        if self.action == "create":
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return TravelPlan.objects.filter(user=self.request.user)
        return TravelPlan.objects.none()

    def create(self, request, *args, **kwargs):
        ser = TravelPlanCreateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data
        generated = generate_travel_plan(
            destination=data["destination"],
            days=data["days"],
            budget=data["budget"],
            travelers=data["travelers"],
            interests=data.get("interests") or [],
            preferences=data.get("preferences") or "",
        )
        plan = TravelPlan.objects.create(
            user=request.user if request.user.is_authenticated else None,
            title=generated["title"],
            origin=data.get("origin") or "Bakı",
            destination=data["destination"],
            days=data["days"],
            budget=data["budget"],
            currency=data.get("currency") or "USD",
            travelers=data["travelers"],
            interests=data.get("interests") or [],
            preferences=data.get("preferences") or "",
            itinerary=generated["itinerary"],
            estimated_total=generated["estimated_total"],
            demo=generated["demo"],
        )
        payload = TravelPlanSerializer(plan).data
        payload["tips"] = generated["tips"]
        return Response(payload, status=status.HTTP_201_CREATED)


class ExploreCountryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ExploreCountry.objects.filter(is_featured=True)
    serializer_class = ExploreCountrySerializer
    lookup_field = "slug"
    search_fields = ["name", "name_az", "capital", "region"]
    filterset_fields = ["region"]


class BudgetEstimateViewSet(viewsets.ModelViewSet):
    serializer_class = BudgetEstimateSerializer
    http_method_names = ["get", "post", "head", "options"]

    def get_permissions(self):
        if self.action == "create":
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return BudgetEstimate.objects.filter(user=self.request.user)
        return BudgetEstimate.objects.none()

    def create(self, request, *args, **kwargs):
        ser = BudgetCreateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        calc = calculate_budget(**ser.validated_data)
        obj = BudgetEstimate.objects.create(
            user=request.user if request.user.is_authenticated else None,
            destination=calc["destination"],
            days=calc["days"],
            travelers=calc["travelers"],
            style=calc["style"],
            flight_cost=calc["flight_cost"],
            hotel_cost=calc["hotel_cost"],
            food_cost=calc["food_cost"],
            activities_cost=calc["activities_cost"],
            transfer_cost=calc["transfer_cost"],
            insurance_cost=calc["insurance_cost"],
            total=calc["total"],
            currency=calc["currency"],
            breakdown=calc["breakdown"],
            demo=True,
        )
        return Response(BudgetEstimateSerializer(obj).data, status=status.HTTP_201_CREATED)


class ComparisonViewSet(viewsets.ModelViewSet):
    serializer_class = ComparisonSerializer
    http_method_names = ["get", "post", "head", "options"]
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return Comparison.objects.filter(user=self.request.user)
        return Comparison.objects.all()[:20]

    def create(self, request, *args, **kwargs):
        ser = ComparisonCreateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        object_type = ser.validated_data["object_type"]
        ids = ser.validated_data["item_ids"]
        model = Tour if object_type == "tour" else Hotel
        rows = list(model.objects.filter(id__in=ids))
        snapshot = []
        for row in rows:
            dest = getattr(row, "destination", None)
            dest_name = getattr(dest, "name", "") if dest else ""
            snapshot.append(
                {
                    "id": row.id,
                    "slug": row.slug,
                    "title": getattr(row, "title", None) or getattr(row, "name", ""),
                    "price": float(getattr(row, "price", None) or getattr(row, "price_from", 0) or 0),
                    "currency": getattr(row, "currency", "USD"),
                    "image": getattr(row, "image_url", "") or "",
                    "location": dest_name or getattr(row, "address", "") or "",
                    "summary": getattr(row, "summary", "") or getattr(row, "description", "") or "",
                    "rating": float(getattr(row, "rating", 0) or 0),
                    "nights": getattr(row, "duration_nights", None),
                    "days": getattr(row, "duration_days", None),
                    "stars": getattr(row, "stars", None),
                    "amenities": getattr(row, "amenities", None) or getattr(row, "includes", None) or [],
                }
            )
        obj = Comparison.objects.create(
            user=request.user if request.user.is_authenticated else None,
            object_type=object_type,
            item_ids=ids,
            items_snapshot=snapshot,
            notes=ser.validated_data.get("notes") or "",
        )
        return Response(ComparisonSerializer(obj).data, status=status.HTTP_201_CREATED)


class Venue360ViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Venue360.objects.filter(is_active=True)
    serializer_class = Venue360Serializer
    lookup_field = "slug"
    search_fields = ["title", "location", "country"]


class TripViewSet(viewsets.ModelViewSet):
    serializer_class = TripSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Trip.objects.filter(user=self.request.user).prefetch_related("items")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TripItemView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, trip_id):
        trip = Trip.objects.filter(user=request.user, id=trip_id).first()
        if not trip:
            return Response({"detail": "Trip not found"}, status=404)
        ser = TripItemCreateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        item = TripItem.objects.create(trip=trip, **ser.validated_data)
        return Response(TripItemSerializer(item).data, status=201)

    def delete(self, request, trip_id):
        item_id = request.data.get("item_id") or request.query_params.get("item_id")
        trip = Trip.objects.filter(user=request.user, id=trip_id).first()
        if not trip:
            return Response({"detail": "Trip not found"}, status=404)
        TripItem.objects.filter(trip=trip, id=item_id).delete()
        return Response(status=204)


class SmartDealViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SmartDeal.objects.filter(is_active=True)
    serializer_class = SmartDealSerializer
    lookup_field = "slug"
    filterset_fields = ["destination", "is_featured"]
    search_fields = ["title", "destination", "summary"]


class AssistantChatView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        ser = AssistantChatSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        message = ser.validated_data["message"]
        thread_id = ser.validated_data.get("thread_id")
        session_key = ser.validated_data.get("session_key") or ""
        thread = None
        if thread_id:
            thread = AssistantThread.objects.filter(id=thread_id).first()
        if not thread and request.user.is_authenticated:
            thread = AssistantThread.objects.filter(user=request.user).order_by("-updated_at").first()
        if not thread:
            thread = AssistantThread.objects.create(
                user=request.user if request.user.is_authenticated else None,
                session_key=session_key,
                title=(message[:60] or "AI Travel Assistant"),
            )
        AssistantMessage.objects.create(thread=thread, role="user", content=message, demo=True)
        reply = assistant_reply(message)
        AssistantMessage.objects.create(
            thread=thread,
            role="assistant",
            content=reply["content"],
            meta={"suggestions": reply["suggestions"]},
            demo=True,
        )
        thread.save(update_fields=["updated_at"])
        return Response(
            {
                "thread": AssistantThreadSerializer(thread).data,
                "reply": reply["content"],
                "suggestions": reply["suggestions"],
                "demo": True,
            }
        )


class AssistantThreadViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AssistantThreadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return AssistantThread.objects.filter(user=self.request.user).prefetch_related("messages")


class WishlistViewSet(viewsets.ModelViewSet):
    serializer_class = WishlistItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "post", "delete", "head", "options"]

    def get_queryset(self):
        return WishlistItem.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        existing = WishlistItem.objects.filter(
            user=request.user,
            kind=data.get("kind"),
            slug=data.get("slug") or "",
            title=data.get("title") or "",
        ).first()
        if existing:
            return Response(WishlistItemSerializer(existing).data, status=200)
        return super().create(request, *args, **kwargs)


class DashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        bookings = Booking.objects.filter(user=user)
        trips = Trip.objects.filter(user=user)
        wishlist = WishlistItem.objects.filter(user=user)
        plans = TravelPlan.objects.filter(user=user)
        wallet = LabpointWallet.objects.filter(user=user).first()
        favorites = Favorite.objects.filter(user=user).count()
        recent_bookings = list(
            bookings.order_by("-created_at")[:5].values("id", "title", "status", "total", "currency", "booking_type", "reference")
        )
        upcoming_trips = list(
            trips.exclude(status="completed").order_by("start_date")[:5].values("id", "title", "destination", "status", "start_date", "end_date")
        )
        deals = SmartDealSerializer(SmartDeal.objects.filter(is_active=True, is_featured=True)[:4], many=True).data
        return Response(
            {
                "user": {"email": user.email, "first_name": user.first_name, "last_name": user.last_name},
                "stats": {
                    "bookings": bookings.count(),
                    "spent": float(bookings.aggregate(s=Sum("total"))["s"] or 0),
                    "trips": trips.count(),
                    "wishlist": wishlist.count(),
                    "plans": plans.count(),
                    "favorites": favorites,
                    "labpoint": float(wallet.balance) if wallet else 0,
                },
                "recent_bookings": recent_bookings,
                "upcoming_trips": upcoming_trips,
                "wishlist_preview": WishlistItemSerializer(wishlist[:6], many=True).data,
                "smart_deals": deals,
                "demo": True,
            }
        )
