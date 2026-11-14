from rest_framework.routers import DefaultRouter

from .views import DestinationViewSet, HotelViewSet, ServiceViewSet, TourViewSet

router = DefaultRouter()
router.register("destinations", DestinationViewSet, basename="destination")
router.register("tours", TourViewSet, basename="tour")
router.register("hotels", HotelViewSet, basename="hotel")
router.register("services", ServiceViewSet, basename="service")

urlpatterns = router.urls
