from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend


class UsernameOrEmailBackend(ModelBackend):
    """Django admin: login with username `admin` or email."""

    def authenticate(self, request, username=None, password=None, **kwargs):
        UserModel = get_user_model()
        if username is None:
            username = kwargs.get(UserModel.USERNAME_FIELD)
        if not username or password is None:
            return None

        user = None
        login = str(username).strip()
        if "@" in login:
            user = UserModel.objects.filter(email__iexact=login).first()
        else:
            user = UserModel.objects.filter(username__iexact=login).first()
            if user is None:
                user = UserModel.objects.filter(email__iexact=login).first()

        if user and user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None
