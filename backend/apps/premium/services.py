"""Demo AI / calculator helpers. Real external AI can replace generate_* later."""

from __future__ import annotations

from decimal import Decimal

from django.conf import settings


def generate_travel_plan(destination: str, days: int, budget: Decimal, travelers: int, interests: list[str], preferences: str = "") -> dict:
    interests = interests or ["mədəniyyət", "qastronomiya"]
    days = max(2, min(int(days or 5), 14))
    travelers = max(1, int(travelers or 2))
    budget = Decimal(budget or 1000)
    per_day = (budget / days).quantize(Decimal("0.01"))
    itinerary = []
    templates = [
        ("Gəliş və şəhər gəzintisi", "Hava limanı transferi, otel check-in, axşam gəzintisi."),
        ("Əsas görməli yerlər", "Mərkəzi muzeylər, tarixi məhəllələr və foto dayanaqları."),
        ("Yerli mətbəx günü", "Restoranlar, bazar və lokal dadlar."),
        ("Təbiət / istirahət", "Park, çimərlik və ya dağ gəzintisi."),
        ("Alış-veriş və suvenir", "Mall, lokal mağazalar və axşam şousu."),
        ("Gizli noktalar", "Yerli bələdçi ilə alternatív marşrut."),
        ("Sərbəst gün", "Könüllü aktivitələr və istirahət."),
        ("Qayıdış", "Səhər sərbəst vaxt, transfer və uçuş."),
    ]
    for i in range(days):
        title, text = templates[i % len(templates)]
        focus = interests[i % len(interests)]
        itinerary.append(
            {
                "day": i + 1,
                "title": f"Gün {i + 1}: {title}",
                "focus": focus,
                "activities": [text, f"Fokus: {focus}", "Labpoint bonus qazanma şansı"],
                "estimated_cost": float(per_day),
            }
        )
    tips = [
        f"{destination} üçün {days} günlük fərdi plan hazırlandı.",
        "Demo AI: real LLM inteqrasiyası olmadan qayda əsaslı generator işləyir.",
        preferences[:180] if preferences else "Maraqlarınıza uyğun balanslaşdırılmış itinerary.",
    ]
    return {
        "title": f"{destination} — {days} gün AI plan",
        "itinerary": itinerary,
        "estimated_total": float(budget),
        "tips": tips,
        "demo": bool(getattr(settings, "DEMO_MODE", True)),
    }


STYLE_RATES = {
    "budget": {"flight": 180, "hotel": 45, "food": 25, "activities": 15, "transfer": 20, "insurance": 12},
    "comfort": {"flight": 280, "hotel": 90, "food": 45, "activities": 35, "transfer": 35, "insurance": 25},
    "luxury": {"flight": 520, "hotel": 220, "food": 90, "activities": 80, "transfer": 70, "insurance": 45},
}


def calculate_budget(destination: str, days: int, travelers: int, style: str = "comfort") -> dict:
    days = max(1, min(int(days or 5), 30))
    travelers = max(1, int(travelers or 2))
    rates = STYLE_RATES.get(style, STYLE_RATES["comfort"])
    flight = Decimal(rates["flight"]) * travelers
    hotel = Decimal(rates["hotel"]) * days * max(1, (travelers + 1) // 2)
    food = Decimal(rates["food"]) * days * travelers
    activities = Decimal(rates["activities"]) * days * travelers
    transfer = Decimal(rates["transfer"]) * travelers
    insurance = Decimal(rates["insurance"]) * travelers
    total = flight + hotel + food + activities + transfer + insurance
    return {
        "destination": destination,
        "days": days,
        "travelers": travelers,
        "style": style,
        "flight_cost": flight,
        "hotel_cost": hotel,
        "food_cost": food,
        "activities_cost": activities,
        "transfer_cost": transfer,
        "insurance_cost": insurance,
        "total": total,
        "currency": "USD",
        "breakdown": {
            "flight": float(flight),
            "hotel": float(hotel),
            "food": float(food),
            "activities": float(activities),
            "transfer": float(transfer),
            "insurance": float(insurance),
            "per_person": float((total / travelers).quantize(Decimal("0.01"))),
            "note": f"Demo kalkulyator — {destination} üçün {style} stil qiymətləndirməsi",
        },
        "demo": True,
    }


def assistant_reply(message: str) -> dict:
    text = (message or "").lower()
    if any(k in text for k in ["viza", "visa", "schengen"]):
        reply = "Viza üçün /viza səhifəsindən ölkə seçin və formu göndərin. Demo rejimdə mütəxəssis sorğusu Contact API-yə yazılır."
        suggestions = ["/viza", "/faq"]
    elif any(k in text for k in ["büdcə", "budget", "qiymət"]):
        reply = "Büdcəni /budget səhifəsində hesablaya bilərsiniz. Stil: budget / comfort / luxury."
        suggestions = ["/budget", "/endirimler"]
    elif any(k in text for k in ["tur", "otel", "hotel", "müqayisə", "compare"]):
        reply = "Tur və otelləri /compare səhifəsində yan-yana müqayisə edin. Seçimləri wishlist-ə də əlavə edə bilərsiniz."
        suggestions = ["/compare", "/tours", "/hotels"]
    elif any(k in text for k in ["plan", "itinerary", "marşrut"]):
        reply = "AI Travel Planner ilə fərdi plan yaradın: /ai-planner. Nəticəni My Trip-ə köçürə bilərsiniz."
        suggestions = ["/ai-planner", "/my-trip"]
    elif any(k in text for k in ["labpoint", "bonus", "endirim"]):
        reply = "Labpoint hər bron zamanı bonus verir. Smart Deals və /endirimler səhifələrinə baxın."
        suggestions = ["/smart-deals", "/labpoint"]
    else:
        reply = (
            "Mən Travellab AI Travel Assistant-am (demo). "
            "Plan, büdcə, viza, tur müqayisəsi, 360° məkan və My Trip haqqında sual verə bilərsiniz."
        )
        suggestions = ["/ai-planner", "/map", "/dashboard", "/assistant"]
    return {"content": reply, "suggestions": suggestions, "demo": True}
