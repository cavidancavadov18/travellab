from django.urls import path

from .views import LabpointBalanceView, LabpointHistoryView, LabpointRedeemView

urlpatterns = [
    path("balance/", LabpointBalanceView.as_view(), name="labpoint-balance"),
    path("history/", LabpointHistoryView.as_view(), name="labpoint-history"),
    path("redeem/", LabpointRedeemView.as_view(), name="labpoint-redeem"),
]
