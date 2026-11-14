from datetime import date, timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand

from apps.premium.models import ExploreCountry, SmartDeal, Venue360


class Command(BaseCommand):
    help = "Seed premium explore countries, 360 venues and smart deals"

    def handle(self, *args, **options):
        countries = [
            ("Maldives", "Maldiv adaları", "maldives", "Asia", "Malé", 3.2028, 73.2207, "/images/destinations/maldives.jpg", "Overwater villa", "Nov-Apr", 1150),
            ("Turkey", "Türkiyə", "turkey", "Europe/Asia", "Ankara", 39.9334, 32.8597, "/images/destinations/istanbul.jpg", "İstanbul & Kapadokiya", "Apr-Oct", 280),
            ("UAE", "BƏE", "uae", "MENA", "Abu Dhabi", 24.4539, 54.3773, "/images/destinations/dubai.jpg", "Dubai lights", "Nov-Mar", 320),
            ("Thailand", "Tayland", "thailand", "Asia", "Bangkok", 13.7563, 100.5018, "/images/destinations/phuket.jpg", "Phuket & Bangkok", "Nov-Feb", 450),
            ("France", "Fransa", "france", "Europe", "Paris", 48.8566, 2.3522, "/images/destinations/paris.jpg", "Paris romance", "Apr-Jun", 380),
            ("Italy", "İtaliya", "italy", "Europe", "Rome", 41.9028, 12.4964, "/images/destinations/rome.jpg", "Roma & Milan", "May-Sep", 360),
            ("USA", "ABŞ", "usa", "Americas", "Washington", 40.7128, -74.0060, "/images/destinations/newyork.jpg", "New York lights", "Sep-Nov", 650),
            ("Georgia", "Gürcüstan", "georgia", "CIS", "Tbilisi", 41.7151, 44.8271, "/images/destinations/tbilisi.jpg", "Tbilisi weekend", "May-Oct", 120),
            ("South Korea", "Cənubi Koreya", "south-korea", "Asia", "Seoul", 37.5665, 126.9780, "/images/destinations/seoul.jpg", "Seul & Busan", "Mar-May", 520),
            ("Singapore", "Sinqapur", "singapore", "Asia", "Singapore", 1.3521, 103.8198, "/images/destinations/singapore.jpg", "Garden city", "Year-round", 480),
            ("Austria", "Avstriya", "austria", "Europe", "Vienna", 48.2082, 16.3738, "/images/destinations/vienna.jpg", "Vyana klassikası", "Dec-Jan", 340),
            ("Indonesia", "İndoneziya", "indonesia", "Asia", "Jakarta", -8.4095, 115.1889, "/images/destinations/bali.jpg", "Bali escape", "Apr-Oct", 510),
        ]
        for name, name_az, slug, region, capital, lat, lng, image, highlight, season, price in countries:
            ExploreCountry.objects.update_or_create(
                slug=slug,
                defaults={
                    "name": name,
                    "name_az": name_az,
                    "region": region,
                    "capital": capital,
                    "lat": lat,
                    "lng": lng,
                    "summary": f"{name_az} — Travellab ilə kəşf ediləcək premium istiqamət.",
                    "best_season": season,
                    "avg_flight_price": Decimal(price),
                    "image_url": image,
                    "highlights": [highlight, "Labpoint bonus", "Demo AI plan"],
                    "is_featured": True,
                },
            )

        venues = [
            ("maldives-overwater", "Maldiv Overwater Villa", "Maldives", "North Male Atoll", "/images/destinations/maldives.jpg", "maldiv-escape"),
            ("istanbul-bosphorus", "İstanbul Boğaz Mənzərəsi", "Turkey", "İstanbul", "/images/destinations/istanbul.jpg", "istanbul-yeni-il"),
            ("dubai-marina", "Dubai Marina Night", "UAE", "Dubai", "/images/destinations/dubai.jpg", ""),
            ("phuket-beach", "Phuket Beach 360", "Thailand", "Phuket", "/images/destinations/phuket.jpg", "phuket-tropik"),
            ("paris-skyline", "Paris Skyline", "France", "Paris", "/images/destinations/paris.jpg", ""),
            ("bali-temple", "Bali Temple Circle", "Indonesia", "Bali", "/images/destinations/bali.jpg", ""),
        ]
        for slug, title, country, location, cover, tour_slug in venues:
            Venue360.objects.update_or_create(
                slug=slug,
                defaults={
                    "title": title,
                    "country": country,
                    "location": location,
                    "description": f"{title} — interaktiv 360° demo panoraması.",
                    "cover_image": cover,
                    "panorama_url": cover,
                    "hotspots": [
                        {"yaw": 20, "pitch": 0, "label": "Mənzərə"},
                        {"yaw": 140, "pitch": -5, "label": "Lounge"},
                        {"yaw": 250, "pitch": 5, "label": "Pool / Terrace"},
                    ],
                    "related_tour_slug": tour_slug,
                    "is_active": True,
                },
            )

        deals = [
            ("maldives-flash", "Maldiv Flash Deal", "Maldives", 18, 999, "/images/destinations/maldives.jpg", "/tours?search=Maldiv", ["flash", "beach"]),
            ("istanbul-weekend", "İstanbul Weekend -15%", "Turkey", 15, 499, "/images/destinations/istanbul.jpg", "/tours?search=İstanbul", ["city", "weekend"]),
            ("dubai-lights", "Dubai Lights Smart Deal", "UAE", 12, 589, "/images/destinations/dubai.jpg", "/tours?search=Dubai", ["luxury"]),
            ("phuket-tropic", "Phuket Tropik", "Thailand", 20, 799, "/images/destinations/phuket.jpg", "/tours?search=Phuket", ["beach"]),
            ("europe-capitals", "Avropa Paytaxtları", "Europe", 10, 890, "/images/destinations/paris.jpg", "/tours?search=Avropa", ["culture"]),
            ("labpoint-boost", "Labpoint Boost Week", "Global", 25, 0, "/images/stories/labpoint-001.jpg", "/labpoint", ["labpoint", "bonus"]),
        ]
        until = date.today() + timedelta(days=45)
        for slug, title, dest, discount, price, image, href, tags in deals:
            SmartDeal.objects.update_or_create(
                slug=slug,
                defaults={
                    "title": title,
                    "summary": f"{title} — Smart Deals demo təklifi. Labpoint ilə birləşdirin.",
                    "destination": dest,
                    "discount_percent": discount,
                    "price_from": Decimal(price),
                    "image_url": image,
                    "tags": tags,
                    "valid_until": until,
                    "cta_href": href,
                    "is_active": True,
                    "is_featured": True,
                    "score": 60 + discount,
                },
            )

        self.stdout.write(self.style.SUCCESS("Premium demo data ready."))
