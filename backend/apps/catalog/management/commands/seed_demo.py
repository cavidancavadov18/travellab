from datetime import date, timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils.text import slugify

from apps.catalog.models import Destination, Hotel, Service, Tour
from apps.cms.models import Partner
from apps.flights.models import Airport, FlightRoute
from apps.reviews.models import Review
from apps.shop.models import Product

User = get_user_model()

# Local Travellab.az assets served by Next.js from /public/images
IMG = {
    "istanbul": "/images/destinations/istanbul.jpg",
    "dubai": "/images/destinations/dubai.jpg",
    "maldives": "/images/destinations/maldives.jpg",
    "paris": "/images/destinations/paris.jpg",
    "tokyo": "/images/destinations/tokyo.jpg",
    "bali": "/images/destinations/bali.jpg",
    "tbilisi": "/images/destinations/tbilisi.jpg",
    "rome": "/images/destinations/rome.jpg",
    "newyork": "/images/destinations/newyork.jpg",
    "phuket": "/images/destinations/phuket.jpg",
    "seoul": "/images/destinations/seoul.jpg",
    "vienna": "/images/destinations/vienna.jpg",
    "hotel": "/images/hotels/hero-pool.jpg",
    "hotel_room": "/images/hotels/hero-room.jpg",
    "shop": "/images/shop/lifestyle-bottle.jpg",
    "shop_woman": "/images/shop/lifestyle-woman.jpg",
    "ataa": "/images/partners/aztaa-logo.jpeg",
}

SHOP_IMG = {
    "baseus-power-bank-10000w": "/images/shop/products/TB-001-1.png",
    "travel-neck-pillow": "/images/shop/products/TB-002-1.png",
    "aroma-travel-set": "/images/shop/products/TB-003-1.png",
    "first-aid-travel-kit": "/images/shop/products/TB-005-1.jpg",
    "cabin-suitcase-55cm": "/images/shop/products/TB-017-1.jpg",
    "rfid-passport-holder": "/images/shop/products/TB-004-1.jpg",
    "noise-cancelling-earplugs": "/images/shop/products/TB-004-1.jpg",
    "compression-packing-cubes": "/images/shop/products/TB-017-1.jpg",
}


class Command(BaseCommand):
    help = "Seed Travellab demo catalog, flights, shop, reviews and admin user"

    def handle(self, *args, **options):
        self.stdout.write("Seeding demo data...")
        self._users()
        destinations = self._destinations()
        self._tours(destinations)
        self._hotels(destinations)
        self._services()
        self._airports_routes()
        self._shop()
        self._reviews()
        self._partners()
        self._labpoints()
        try:
            from django.core.management import call_command

            call_command("seed_premium")
        except Exception as exc:  # noqa: BLE001 — demo seed should continue
            self.stdout.write(self.style.WARNING(f"seed_premium skipped: {exc}"))
        self.stdout.write(self.style.SUCCESS("Demo data ready."))

    def _users(self):
        admin_user = User.objects.filter(username="admin").first()
        if admin_user is None:
            admin_user = User.objects.filter(email="admin@travellab.az").first()
        if admin_user is None:
            User.objects.create_superuser(
                email="admin@travellab.az",
                password="admin",
                username="admin",
                first_name="Admin",
                last_name="Travellab",
            )
        else:
            admin_user.username = "admin"
            admin_user.email = "admin@travellab.az"
            admin_user.set_password("admin")
            admin_user.is_staff = True
            admin_user.is_superuser = True
            admin_user.is_active = True
            admin_user.first_name = admin_user.first_name or "Admin"
            admin_user.last_name = admin_user.last_name or "Travellab"
            admin_user.save()
        if not User.objects.filter(email="demo@travellab.az").exists():
            User.objects.create_user(
                email="demo@travellab.az",
                password="Demo1234!",
                first_name="Demo",
                last_name="Traveler",
            )

    def _labpoints(self):
        from decimal import Decimal

        from apps.labpoint.services import earn_points, get_or_create_wallet

        for email, amount in (("demo@travellab.az", "250.00"), ("admin@travellab.az", "500.00")):
            user = User.objects.filter(email=email).first()
            if not user:
                continue
            wallet = get_or_create_wallet(user)
            target = Decimal(amount)
            if wallet.balance < target:
                earn_points(user, target - wallet.balance, description="Demo seed Labpoint", booking_reference="SEED")

    def _destinations(self):
        rows = [
            ("İstanbul", "Istanbul", "Стамбул", "istanbul", "Türkiyə", "TR", True, IMG["istanbul"]),
            ("Dubay", "Dubai", "Дубай", "dubai", "BƏƏ", "AE", True, IMG["dubai"]),
            ("Maldiv", "Maldives", "Мальдивы", "maldives", "Maldiv adaları", "MV", True, IMG["maldives"]),
            ("Paris", "Paris", "Париж", "paris", "Fransa", "FR", True, IMG["paris"]),
            ("Tokio", "Tokyo", "Токио", "tokyo", "Yaponiya", "JP", True, IMG["tokyo"]),
            ("Bali", "Bali", "Бали", "bali", "İndoneziya", "ID", True, IMG["bali"]),
            ("Tbilisi", "Tbilisi", "Тбилиси", "tbilisi", "Gürcüstan", "GE", True, IMG["tbilisi"]),
            ("Roma", "Rome", "Рим", "rome", "İtaliya", "IT", True, IMG["rome"]),
            ("New York", "New York", "Нью-Йорк", "new-york", "ABŞ", "US", True, IMG["newyork"]),
            ("Phuket", "Phuket", "Пхукет", "phuket", "Tayland", "TH", True, IMG["phuket"]),
            ("Seul", "Seoul", "Сеул", "seoul", "Cənubi Koreya", "KR", False, IMG["seoul"]),
            ("Vyana", "Vienna", "Вена", "vienna", "Avstriya", "AT", False, IMG["vienna"]),
        ]
        result = {}
        Destination.objects.filter(slug="turkey").delete()
        for name, name_en, name_ru, slug, country, code, popular, image in rows:
            obj, _ = Destination.objects.update_or_create(
                slug=slug,
                defaults={
                    "name": name,
                    "name_en": name_en,
                    "name_ru": name_ru,
                    "country": country,
                    "country_code": code,
                    "region": "Popular",
                    "short_description": f"{name} — premium istiqamət",
                    "description": f"{name} istiqaməti Travellab premium kataloqunda.",
                    "image_url": image,
                    "is_popular": popular,
                    "is_active": True,
                },
            )
            result[slug] = obj
        return result

    def _tours(self, destinations):
        tours = [
            ("maldives", "Maldiv Escape", "Yerdəki cənnət — overwater villa", "premium", 7, 6, "1150", True),
            ("istanbul", "İstanbul Yeni İl", "Boğaz mənzərəli yeni il turu", "turkey", 5, 4, "589", True),
            ("phuket", "Phuket Tropik", "6 gecə tropik istirahət", "asia", 7, 6, "899", True),
            ("new-york", "New York Lights", "Yeni ili Times Square-də qarşılayın", "premium", 6, 5, "1490", True),
            ("rome", "Roma & Milan", "İtaliya romantika və dəb", "europe", 8, 7, "1290", True),
            ("seoul", "Seul + Busan", "Cənubi Koreya kəşf turu", "asia", 7, 6, "1180", False),
            ("tbilisi", "Tbilisi Weekend", "Qafqaz dadı və şəhər turu", "group", 4, 3, "249", True),
            ("dubai", "Dubai Luxe", "Desert safari + burj views", "premium", 5, 4, "799", True),
            ("bali", "Bali Wellness", "Yoga, məbədlər və okean", "honeymoon", 8, 7, "1090", True),
            ("paris", "Paris Romance", "Şəhər işıqları və muzeylər", "honeymoon", 5, 4, "980", True),
            ("tokyo", "Tokyo Neon", "Müasir Yaponiya təcrübəsi", "asia", 7, 6, "1350", False),
            ("vienna", "Vyana & Praqa", "Avropa paytaxtları qış turu", "europe", 6, 5, "920", True),
            ("istanbul", "Uludağ Ski Escape", "İstanbul + Uludağ qış", "sports", 5, 4, "640", False),
            ("dubai", "Abu Dhabi Concert", "Konsert + şəhər turu", "concert", 4, 3, "720", False),
            ("maldives", "Honeymoon Overwater", "Balayı villa paketi", "honeymoon", 6, 5, "1680", True),
            ("rome", "Italy Grand", "Roma, Florensiya, Venesiya", "europe", 9, 8, "1590", False),
            ("phuket", "Thailand Combo", "Phuket + Bangkok", "asia", 8, 7, "1040", False),
            ("paris", "Europe Capitals", "Paris-Vyana-Praqa", "group", 9, 8, "1420", True),
            ("tbilisi", "Georgia Wine Trail", "Şərab və dağlar", "group", 5, 4, "390", False),
            ("new-york", "USA East Coast", "NYC + Boston", "premium", 8, 7, "1890", False),
        ]
        start = date.today() + timedelta(days=21)
        for i, (dest, title, summary, category, days, nights, price, featured) in enumerate(tours):
            slug = slugify(title)
            Tour.objects.update_or_create(
                slug=slug,
                defaults={
                    "destination": destinations[dest],
                    "title": title,
                    "title_en": title,
                    "title_ru": title,
                    "summary": summary,
                    "description": f"{title}. {summary}. Paketə aviabilet, otel və transfer daxildir.",
                    "category": category,
                    "duration_days": days,
                    "duration_nights": nights,
                    "price": Decimal(price),
                    "currency": "USD",
                    "price_azn": Decimal(price) * Decimal("1.7"),
                    "labpoint_earn": (Decimal(price) * Decimal("0.02")).quantize(Decimal("0.01")),
                    "image_url": destinations[dest].image_url,
                    "gallery": [destinations[dest].image_url, IMG["hotel"]],
                    "itinerary": [
                        {"day": 1, "title": "Arrival", "text": "Transfer və otel yerləşmə"},
                        {"day": 2, "title": "City tour", "text": "Görməli yerlər və nahar"},
                        {"day": days, "title": "Departure", "text": "Hava limanı transferi"},
                    ],
                    "includes": ["Aviabilet", "Otel", "Transfer", "Sığorta konsultasiyası"],
                    "excludes": ["Şəxsi xərclər", "Viza rüsumu"],
                    "start_date": start + timedelta(days=i * 3),
                    "end_date": start + timedelta(days=i * 3 + days),
                    "seats_left": 8 + (i % 5),
                    "is_featured": featured,
                    "is_active": True,
                    "rating": Decimal("4.70") + Decimal(str((i % 3) * 0.1)),
                },
            )

    def _hotels(self, destinations):
        for i, (slug, dest) in enumerate(destinations.items()):
            Hotel.objects.update_or_create(
                slug=f"{slug}-grand-hotel",
                defaults={
                    "destination": dest,
                    "name": f"{dest.name_en or dest.name} Grand Hotel",
                    "stars": 4 + (i % 2),
                    "address": f"Central district, {dest.name_en or dest.name}",
                    "description": "Premium stay with breakfast and city views.",
                    "amenities": ["Wi-Fi", "Spa", "Pool", "Breakfast", "Airport transfer"],
                    "image_url": IMG["hotel"] if i % 2 == 0 else IMG["hotel_room"],
                    "gallery": [IMG["hotel"], IMG["hotel_room"], dest.image_url],
                    "price_from": Decimal("89") + Decimal(i * 15),
                    "currency": "USD",
                    "rating": Decimal("4.50"),
                    "is_featured": i < 6,
                    "is_active": True,
                },
            )
            if i < 3:
                Hotel.objects.update_or_create(
                    slug=f"{slug}-boutique",
                    defaults={
                        "destination": dest,
                        "name": f"{dest.name_en or dest.name} Boutique",
                        "stars": 5,
                        "address": f"Old town, {dest.name_en or dest.name}",
                        "description": "Boutique luxury for discerning travelers.",
                        "amenities": ["Wi-Fi", "Concierge", "Restaurant", "Bar"],
                        "image_url": dest.image_url,
                        "gallery": [dest.image_url],
                        "price_from": Decimal("160") + Decimal(i * 20),
                        "currency": "USD",
                        "rating": Decimal("4.90"),
                        "is_featured": True,
                        "is_active": True,
                    },
                )

    def _services(self):
        services = [
            ("visa", "Viza dəstəyi", "Schengen və digər vizalar üçün peşəkar dəstək", "120"),
            ("transfer", "Transfer", "Hava limanı və şəhərdaxili VIP transfer", "45"),
            ("insurance", "Səyahət sığortası", "Tibbi və bagaj sığortası paketləri", "25"),
            ("gift_card", "Hədiyyə kartı", "Sevdikləriniz üçün Travellab hədiyyə kartı", "50"),
            ("corporate", "Korporativ səyahət", "Şirkət səfərləri və MICE həlləri", "0"),
        ]
        for i, (stype, title, summary, price) in enumerate(services):
            Service.objects.update_or_create(
                slug=slugify(title),
                defaults={
                    "title": title,
                    "title_en": title,
                    "title_ru": title,
                    "service_type": stype,
                    "summary": summary,
                    "description": summary,
                    "price_from": Decimal(price) if price != "0" else None,
                    "currency": "AZN",
                    "image_url": IMG["istanbul"],
                    "features": ["24/7 dəstək", "Sürətli proses", "Şəffaf qiymət"],
                    "is_active": True,
                    "sort_order": i,
                },
            )

    def _airports_routes(self):
        airports = [
            ("GYD", "Bakı", "Azərbaycan", "Heydər Əliyev Beynəlxalq"),
            ("IST", "İstanbul", "Türkiyə", "İstanbul Airport"),
            ("DXB", "Dubay", "BƏƏ", "Dubai International"),
            ("CDG", "Paris", "Fransa", "Charles de Gaulle"),
            ("NRT", "Tokio", "Yaponiya", "Narita"),
            ("JFK", "New York", "ABŞ", "John F. Kennedy"),
            ("TBS", "Tbilisi", "Gürcüstan", "Tbilisi International"),
            ("FCO", "Roma", "İtaliya", "Fiumicino"),
            ("BKK", "Banqkok", "Tayland", "Suvarnabhumi"),
            ("ICN", "Seul", "Koreya", "Incheon"),
        ]
        objs = {}
        for code, city, country, name in airports:
            objs[code], _ = Airport.objects.update_or_create(
                code=code,
                defaults={"city": city, "country": country, "name": name},
            )
        # Reference floors in AZN (aligned with travellab.az marketing / observed WL mins).
        # Live inventory always comes from Travelpayouts White Label / Data API.
        routes = [
            ("GYD", "IST", "Turkish Airlines", "TK", "270", 170, 0),
            ("GYD", "IST", "Ajet", "VF", "270", 175, 0),
            ("GYD", "IST", "Pegasus Airlines", "PC", "312", 180, 0),
            ("GYD", "DXB", "Flydubai", "FZ", "200", 210, 0),
            ("GYD", "TBS", "Azerbaijan Airlines", "J2", "110", 75, 0),
            ("GYD", "CDG", "Air France", "AF", "320", 350, 1),
            ("GYD", "JFK", "Turkish Airlines", "TK", "850", 780, 1),
            ("GYD", "NRT", "Qatar Airways", "QR", "920", 820, 1),
            ("GYD", "FCO", "Azerbaijan Airlines", "J2", "310", 300, 0),
            ("GYD", "BKK", "Emirates", "EK", "620", 560, 1),
            ("IST", "GYD", "Turkish Airlines", "TK", "250", 165, 0),
            ("DXB", "GYD", "Flydubai", "FZ", "190", 205, 0),
        ]
        for o, d, airline, code, price, mins, stops in routes:
            FlightRoute.objects.update_or_create(
                origin=objs[o],
                destination=objs[d],
                airline_code=code,
                defaults={
                    "airline": airline,
                    "base_price": Decimal(price),
                    "currency": "AZN",
                    "duration_minutes": mins,
                    "stops": stops,
                    "is_active": True,
                },
            )

    def _shop(self):
        products = [
            ("Travel Neck Pillow", "accessories", "24.90", True),
            ("Baseus Power Bank 10000W", "electronics", "93.60", True),
            ("First Aid Travel Kit", "health", "24.90", True),
            ("Aroma Travel Set", "sets", "18.60", False),
            ("Cabin Suitcase 55cm", "luggage", "129.00", True),
            ("RFID Passport Holder", "accessories", "19.90", False),
            ("Noise Cancelling Earplugs", "electronics", "14.50", False),
            ("Compression Packing Cubes", "luggage", "34.00", True),
        ]
        for name, category, price, featured in products:
            product_slug = slugify(name)
            Product.objects.update_or_create(
                slug=product_slug,
                defaults={
                    "name": name,
                    "category": category,
                    "description": f"{name} — Travellab Shop premium travel gear.",
                    "price": Decimal(price),
                    "currency": "AZN",
                    "image_url": SHOP_IMG.get(product_slug, IMG["shop"]),
                    "stock": 40,
                    "is_featured": featured,
                    "is_active": True,
                },
            )

    def _reviews(self):
        reviews = [
            ("Ülkər müştəri", "az", "Viza prosesi mükəmməl keçdi, çox razıyam.", 5),
            ("Afsana guest", "en", "Outstanding assistance during planning and ticketing.", 5),
            ("Анна", "ru", "Отличный сервис и внимательная команда Travellab.", 5),
            ("Rəşad", "az", "Santorini turu əla təşkil olunmuşdu.", 5),
            ("Leyla", "az", "Labpoint ilə növbəti səfərdə endirim etdim.", 4),
            ("John", "en", "Best agency in Baku for flights and hotels.", 5),
        ]
        if Review.objects.count() < 6:
            for author, locale, body, rating in reviews:
                Review.objects.create(
                    author_name=author,
                    author_locale=locale,
                    rating=rating,
                    body=body,
                    source="Google",
                    is_featured=True,
                    is_active=True,
                )

    def _partners(self):
        for i, name in enumerate(
            ["Turkish Airlines", "Emirates", "Qatar Airways", "Expedia", "Tripadvisor", "ATAA"]
        ):
            Partner.objects.update_or_create(
                name=name,
                defaults={
                    "logo_url": IMG["ataa"] if name == "ATAA" else "",
                    "website": "",
                    "is_active": True,
                    "sort_order": i,
                },
            )
