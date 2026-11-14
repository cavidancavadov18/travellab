from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import AdminStatsView, ContactCreateView, PartnerViewSet

router = DefaultRouter()
router.register("partners", PartnerViewSet, basename="partner")

urlpatterns = router.urls + [
    path("contact/", ContactCreateView.as_view(), name="contact-create"),
    path("admin/stats/", AdminStatsView.as_view(), name="admin-stats"),
]
