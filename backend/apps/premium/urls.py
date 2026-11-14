from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AssistantChatView,
    AssistantThreadViewSet,
    BudgetEstimateViewSet,
    ComparisonViewSet,
    DashboardView,
    ExploreCountryViewSet,
    SmartDealViewSet,
    TravelPlanViewSet,
    TripItemView,
    TripViewSet,
    Venue360ViewSet,
    WishlistViewSet,
)

router = DefaultRouter()
router.register("plans", TravelPlanViewSet, basename="travel-plan")
router.register("countries", ExploreCountryViewSet, basename="explore-country")
router.register("budgets", BudgetEstimateViewSet, basename="budget-estimate")
router.register("comparisons", ComparisonViewSet, basename="comparison")
router.register("venues-360", Venue360ViewSet, basename="venue-360")
router.register("trips", TripViewSet, basename="trip")
router.register("deals", SmartDealViewSet, basename="smart-deal")
router.register("assistant/threads", AssistantThreadViewSet, basename="assistant-thread")
router.register("wishlist", WishlistViewSet, basename="wishlist")

urlpatterns = [
    path("dashboard/", DashboardView.as_view(), name="premium-dashboard"),
    path("assistant/chat/", AssistantChatView.as_view(), name="assistant-chat"),
    path("trips/<int:trip_id>/items/", TripItemView.as_view(), name="trip-items"),
    path("", include(router.urls)),
]
