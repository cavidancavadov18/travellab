"""End-to-end API smoke test against a running Django server."""
from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request

BASE = os.environ.get("API_BASE", "http://127.0.0.1:8000/api/v1").rstrip("/")


def req(method: str, path: str, data: dict | None = None, token: str | None = None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    body = None if data is None else json.dumps(data).encode()
    request = urllib.request.Request(
        f"{BASE}/{path.lstrip('/')}",
        data=body,
        headers=headers,
        method=method,
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            raw = response.read()
            return response.status, json.loads(raw) if raw else {}
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode()
        try:
            payload = json.loads(raw) if raw else {}
        except json.JSONDecodeError:
            payload = {"raw": raw[:300]}
        return exc.code, payload


def ok(label: str, status: int, expect: int | tuple[int, ...] = 200):
    expected = expect if isinstance(expect, tuple) else (expect,)
    mark = "PASS" if status in expected else "FAIL"
    print(f"[{mark}] {label} -> {status}")
    if status not in expected:
        raise SystemExit(1)


def main() -> None:
    st, login = req("POST", "auth/login/", {"email": "demo@travellab.az", "password": "Demo1234!"})
    ok("login", st)
    token = login["access"]

    st, me = req("GET", "auth/me/", token=token)
    ok("auth/me", st)

    st, tours = req("GET", "tours/")
    ok("tours list", st)
    assert tours.get("count", 0) > 0

    slug = tours["results"][0]["slug"]
    st, _ = req("GET", f"tours/{slug}/")
    ok("tour detail", st)

    st, hotels = req("GET", "hotels/")
    ok("hotels list", st)
    hotel = hotels["results"][0]

    st, flights = req(
        "POST",
        "flights/search/",
        {"origin": "GYD", "destination": "IST", "depart_date": "2026-12-15", "passengers": 1},
    )
    ok("flights search", st)
    assert len(flights.get("offers") or []) > 0

    st, booking = req(
        "POST",
        "bookings/",
        {
            "booking_type": "hotel",
            "title": hotel.get("name") or hotel.get("title"),
            "subtotal": str(hotel.get("price_from") or 100),
            "currency": hotel.get("currency") or "USD",
            "contact_email": me["email"],
            "related_object_id": hotel["id"],
            "details": {"slug": hotel["slug"], "smoke": True},
            "pay_now": True,
            "quantity": 1,
        },
        token,
    )
    ok("create booking", st, 201)
    print("  reference:", booking.get("reference"))

    st, fav = req("POST", "favorites/toggle/", {"object_type": "hotel", "object_id": hotel["id"]}, token)
    ok("favorite toggle", st, (200, 201))
    print("  favorited:", fav.get("favorited"))

    st, shop = req("GET", "shop/products/")
    ok("shop products", st)
    product = shop["results"][0]
    st, _ = req("POST", "shop/cart/", {"product_id": product["id"], "quantity": 1}, token)
    ok("shop cart", st)
    st, order = req("POST", "shop/checkout/", {"shipping_address": "Baku smoke"}, token)
    ok("shop checkout", st, 201)
    print("  order:", order.get("reference"))

    st, lp = req("GET", "labpoint/balance/", token=token)
    ok("labpoint balance", st)

    st, contact = req(
        "POST",
        "contact/",
        {"name": "Smoke", "email": "smoke@travellab.az", "phone": "050", "message": "smoke ok", "source": "smoke"},
    )
    ok("contact", st, (200, 201))

    print("All smoke checks passed.")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:  # noqa: BLE001
        print("FAIL:", exc)
        sys.exit(1)
