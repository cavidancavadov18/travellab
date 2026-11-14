from decimal import Decimal

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from apps.labpoint.services import earn_points, get_or_create_wallet

User = get_user_model()


@pytest.mark.django_db
def test_booking_and_labpoint_earn():
    user = User.objects.create_user(email="book@travellab.az", password="StrongPass123!")
    client = APIClient()
    login = client.post(
        "/api/v1/auth/login/",
        {"email": "book@travellab.az", "password": "StrongPass123!"},
        format="json",
    )
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")
    res = client.post(
        "/api/v1/bookings/",
        {
            "booking_type": "tour",
            "title": "Test Tour",
            "subtotal": "100.00",
            "currency": "USD",
            "contact_email": "book@travellab.az",
            "pay_now": True,
            "details": {"demo": True},
        },
        format="json",
    )
    assert res.status_code == 201
    assert res.data["status"] == "paid"
    assert Decimal(res.data["labpoint_earned"]) == Decimal("2.00")
    wallet = get_or_create_wallet(user)
    assert wallet.balance == Decimal("2.00")


@pytest.mark.django_db
def test_labpoint_redeem_validation():
    user = User.objects.create_user(email="lp@travellab.az", password="StrongPass123!")
    earn_points(user, Decimal("10.00"), description="test")
    client = APIClient()
    login = client.post(
        "/api/v1/auth/login/",
        {"email": "lp@travellab.az", "password": "StrongPass123!"},
        format="json",
    )
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")
    bad = client.post("/api/v1/labpoint/redeem/", {"amount": "50"}, format="json")
    assert bad.status_code == 400
    ok = client.post("/api/v1/labpoint/redeem/", {"amount": "4"}, format="json")
    assert ok.status_code == 200
    assert Decimal(ok.data["balance"]) == Decimal("6.00")
