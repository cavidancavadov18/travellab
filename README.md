# Travellab Premium Travel Platform

Modern travel platform for Travellab (Baku): **Next.js 15** frontend + **Django REST** backend + PostgreSQL/SQLite.

UI: travellab.az-inspired green brand (`#049548`). Flights/payments use **demo mode** when external APIs are not configured.

## Stack

- Frontend: Next.js 15 (App Router), TypeScript, Tailwind CSS, Framer Motion, next-intl (AZ/EN/RU)
- Backend: Django 5, DRF, SimpleJWT, django-filter, drf-spectacular
- Database: PostgreSQL via Docker (or SQLite for local demo: `USE_SQLITE=true`)
- Payments / flights / hotels: **demo mode** adapters (no real charges)

## Quick start

### 1. Environment

```bash
cp .env.example .env
```

Default local `.env` uses `USE_SQLITE=true` so Docker is optional.

### 2. Backend

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo
python manage.py runserver 8000
```

API docs: [http://127.0.0.1:8000/api/docs/](http://127.0.0.1:8000/api/docs/)  
Django admin: [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/)

Seed users:

| Login | Password | Role |
|-------|----------|------|
| `admin` or `admin@travellab.az` | `admin` | Superuser |
| `demo@travellab.az` | `Demo1234!` | Customer |

Django Admin: [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/) (`admin` / `admin`)

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App: [http://localhost:3000/az](http://localhost:3000/az)

### 4. PostgreSQL

Docker Desktop işlək olanda:

```bash
docker compose up -d db
```

`.env` içində:

```
USE_SQLITE=false
POSTGRES_HOST=127.0.0.1
POSTGRES_DB=travellab
POSTGRES_USER=travellab
POSTGRES_PASSWORD=travellab
```

Sonra:

```bash
cd backend
python manage.py migrate
python manage.py seed_demo
```

Docker yoxdursa layihə `USE_SQLITE=true` ilə eyni funksionallıqda işləyir; istehsal üçün PostgreSQL tövsiyə olunur.

## Demo mode

With `DEMO_MODE=true`:

- Flight search returns generated offers from seeded routes
- Hotel/tour bookings create real DB records
- Payments always succeed via `DemoPaymentProvider`
- Labpoint earn/redeem works on paid bookings

## Main routes

| Locale path | Purpose |
|-------------|---------|
| `/az`, `/en`, `/ru` | Home |
| `/flights`, `/hotels`, `/tours` | Search & catalog |
| `/shop`, `/labpoint`, `/visa`, `/services` | Commerce & services |
| `/auth/login`, `/auth/register` | JWT auth |
| `/account` | Profile, bookings, favorites, Labpoint |
| `/admin-panel` | Staff stats (requires staff JWT) |

## Tests

```bash
cd backend
.venv\Scripts\python.exe -m pytest
.venv\Scripts\python.exe scripts\smoke_test.py
```

## Smoke checklist

1. Home loads tours/destinations from API  
2. Flight search `GYD → IST` returns offers  
3. Register / login works  
4. Book a tour (demo payment → paid + Labpoint earn)  
5. Toggle favorite on a tour  
6. Shop add-to-cart + checkout  
7. Contact form submits  
8. Language switch AZ/EN/RU  
9. Admin panel stats as `admin@travellab.az`  
10. Mobile layout OK at 375px width  
