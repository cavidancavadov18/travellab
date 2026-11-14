import hashlib
import os
import random
from datetime import datetime, timedelta
from decimal import Decimal
from urllib.parse import urlencode
from urllib.request import Request, urlopen
import json

from django.conf import settings

from .models import Airport, FlightRoute


def _stable_rng(seed: str):
    digest = hashlib.md5(seed.encode()).hexdigest()
    return random.Random(int(digest[:8], 16))


def _travelpayouts_token() -> str:
    return (
        os.environ.get("TRAVELPAYOUTS_TOKEN")
        or getattr(settings, "TRAVELPAYOUTS_TOKEN", "")
        or ""
    ).strip()


def _fetch_travelpayouts_prices(
    origin: str,
    destination: str,
    depart_date: str,
    return_date: str | None,
    passengers: int,
    currency: str = "AZN",
):
    """
    Real calendar/search prices from Travelpayouts Data API (same ecosystem as
    travellab.az White Label). Requires TRAVELPAYOUTS_TOKEN.
    Docs: https://api.travelpayouts.com/aviasales/v3/prices_for_dates
    """
    token = _travelpayouts_token()
    if not token:
        return None

    params = {
        "origin": origin,
        "destination": destination,
        "departure_at": depart_date,
        "currency": currency.lower(),
        "sorting": "price",
        "direct": "false",
        "limit": "30",
        "page": "1",
        "one_way": "false" if return_date else "true",
        "token": token,
    }
    if return_date:
        params["return_at"] = return_date

    url = "https://api.travelpayouts.com/aviasales/v3/prices_for_dates?" + urlencode(params)
    req = Request(url, headers={"Accept": "application/json", "User-Agent": "Travellab/1.0"})
    try:
        with urlopen(req, timeout=12) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
    except Exception:
        return None

    data = payload.get("data") or []
    if not data:
        return {"offers": [], "return_offers": [], "source": "travelpayouts", "demo": False}

    offers = []
    for idx, row in enumerate(data[:20]):
        price = Decimal(str(row.get("price") or 0)).quantize(Decimal("0.01"))
        airline = (row.get("airline") or row.get("airline_code") or "XX").upper()
        depart_at = row.get("departure_at") or f"{depart_date}T12:00:00"
        duration = int(row.get("duration") or row.get("duration_to") or 180)
        stops = int(row.get("transfers") or 0)
        offers.append(
            {
                "id": f"TP-{origin}{destination}-{airline}-{idx}-{depart_date.replace('-', '')}",
                "airline": airline,
                "airline_code": airline[:2] if len(airline) >= 2 else airline,
                "origin": origin,
                "destination": destination,
                "origin_city": origin,
                "destination_city": destination,
                "depart_at": depart_at,
                "arrive_at": row.get("return_at") or "",
                "duration_minutes": duration,
                "stops": stops,
                "cabin": "Economy",
                "price": str(price),
                "total": str((price * passengers).quantize(Decimal("0.01"))),
                "currency": currency.upper(),
                "passengers": passengers,
                "trip_class": "round" if return_date else "oneway",
                "link": row.get("link") or "",
                "demo": False,
                "source": "travelpayouts",
            }
        )

    offers.sort(key=lambda o: Decimal(o["price"]))
    return {
        "offers": offers,
        "return_offers": [],
        "source": "travelpayouts",
        "demo": False,
    }


def search_flights(
    origin: str,
    destination: str,
    depart_date: str,
    return_date: str | None = None,
    passengers: int = 1,
    currency: str = "AZN",
):
    origin = origin.upper().strip()
    destination = destination.upper().strip()
    passengers = max(1, int(passengers or 1))
    currency = (currency or "AZN").upper()

    # 1) Prefer real Travelpayouts Data API when token is configured
    live = _fetch_travelpayouts_prices(origin, destination, depart_date, return_date, passengers, currency)
    if live is not None:
        return {
            "origin": origin,
            "destination": destination,
            "depart_date": depart_date,
            "return_date": return_date,
            "passengers": passengers,
            "currency": currency,
            **live,
        }

    # 2) No live provider — do NOT invent fares as real inventory.
    # Seeded FlightRoute rows are marketing reference floors only (AZN), returned
    # only when DEMO_MODE is on and clearly labelled.
    demo_mode = bool(getattr(settings, "DEMO_MODE", True))
    if not demo_mode:
        return {
            "origin": origin,
            "destination": destination,
            "depart_date": depart_date,
            "return_date": return_date,
            "passengers": passengers,
            "currency": currency,
            "offers": [],
            "return_offers": [],
            "demo": False,
            "source": "none",
            "message": "Real flight provider token yoxdur. Frontend Travelpayouts White Label istifadə edir.",
        }

    routes = list(
        FlightRoute.objects.filter(
            origin__code=origin,
            destination__code=destination,
            is_active=True,
        ).select_related("origin", "destination")
    )

    offers = []
    for idx, route in enumerate(routes[:6]):
        rng = _stable_rng(f"{origin}-{destination}-{depart_date}-{route.airline_code}-{idx}")
        # Reference floor from seed (AZN) — still labelled demo, not live inventory
        price = Decimal(str(route.base_price)).quantize(Decimal("0.01"))
        dep_hour = rng.randint(6, 21)
        dep_min = rng.choice([0, 15, 30, 45])
        duration = route.duration_minutes + rng.randint(-10, 20)
        depart_dt = datetime.fromisoformat(depart_date) + timedelta(hours=dep_hour, minutes=dep_min)
        arrive_dt = depart_dt + timedelta(minutes=duration)
        cur = (route.currency or currency).upper()
        offers.append(
            {
                "id": f"REF-{origin}{destination}-{route.airline_code}-{idx}-{depart_date.replace('-', '')}",
                "airline": route.airline,
                "airline_code": route.airline_code,
                "origin": origin,
                "destination": destination,
                "origin_city": getattr(route.origin, "city", origin),
                "destination_city": getattr(route.destination, "city", destination),
                "depart_at": depart_dt.isoformat(),
                "arrive_at": arrive_dt.isoformat(),
                "duration_minutes": duration,
                "stops": route.stops,
                "cabin": "Economy",
                "price": str(price),
                "total": str((price * passengers).quantize(Decimal("0.01"))),
                "currency": cur,
                "passengers": passengers,
                "demo": True,
                "source": "seed_reference",
                "note": "İstinad qiyməti — real bron üçün Travelpayouts axtarışından istifadə edin.",
            }
        )

    offers.sort(key=lambda o: Decimal(o["price"]))

    return_offers = []
    if return_date and offers:
        back = search_flights(destination, origin, return_date, None, passengers, currency)
        return_offers = back.get("offers") or []

    return {
        "origin": origin,
        "destination": destination,
        "depart_date": depart_date,
        "return_date": return_date,
        "passengers": passengers,
        "currency": currency,
        "offers": offers,
        "return_offers": return_offers,
        "demo": True,
        "source": "seed_reference",
        "message": "Live Travelpayouts token yoxdur; yalnız seed istinad qiymətləri. Əsas UI White Label-dir.",
    }
