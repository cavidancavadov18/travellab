import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()


@pytest.mark.django_db
def test_register_and_me():
    client = APIClient()
    res = client.post(
        "/api/v1/auth/register/",
        {
            "email": "newuser@travellab.az",
            "password": "StrongPass123!",
            "first_name": "New",
            "locale": "az",
        },
        format="json",
    )
    assert res.status_code == 201
    assert "access" in res.data
    token = res.data["access"]
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    me = client.get("/api/v1/auth/me/")
    assert me.status_code == 200
    assert me.data["email"] == "newuser@travellab.az"
    assert "labpoint_balance" in me.data


@pytest.mark.django_db
def test_login():
    User.objects.create_user(email="login@travellab.az", password="StrongPass123!")
    client = APIClient()
    res = client.post(
        "/api/v1/auth/login/",
        {"email": "login@travellab.az", "password": "StrongPass123!"},
        format="json",
    )
    assert res.status_code == 200
    assert "access" in res.data
