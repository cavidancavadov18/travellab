from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class EmailOrUsernameTokenSerializer(TokenObtainPairSerializer):
    """Accept email or username in the `email` login field."""

    username_field = User.EMAIL_FIELD

    def validate(self, attrs):
        login = str(attrs.get(self.username_field) or "").strip()
        if login and "@" not in login:
            user = User.objects.filter(username__iexact=login).first()
            if user:
                attrs[self.username_field] = user.email
        return super().validate(attrs)
