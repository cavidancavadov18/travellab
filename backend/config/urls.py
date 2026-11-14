from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from apps.accounts.forms import AdminAuthenticationForm

admin.site.site_header = "Travellab Admin"
admin.site.site_title = "Travellab"
admin.site.index_title = "İdarə paneli"
admin.site.login_form = AdminAuthenticationForm
admin.site.login_template = "admin/login.html"

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/v1/auth/", include("apps.accounts.urls")),
    path("api/v1/", include("apps.catalog.urls")),
    path("api/v1/flights/", include("apps.flights.urls")),
    path("api/v1/bookings/", include("apps.bookings.urls")),
    path("api/v1/favorites/", include("apps.favorites.urls")),
    path("api/v1/labpoint/", include("apps.labpoint.urls")),
    path("api/v1/shop/", include("apps.shop.urls")),
    path("api/v1/reviews/", include("apps.reviews.urls")),
    path("api/v1/payments/", include("apps.payments.urls")),
    path("api/v1/", include("apps.cms.urls")),
    path("api/v1/premium/", include("apps.premium.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
