from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

User = get_user_model()


class Command(BaseCommand):
    help = "Ensure Django superuser admin / admin exists"

    def handle(self, *args, **options):
        user = User.objects.filter(username="admin").first()
        if user is None:
            user = User.objects.filter(email="admin@travellab.az").first()
        if user is None:
            User.objects.create_superuser(
                email="admin@travellab.az",
                password="admin",
                username="admin",
                first_name="Admin",
                last_name="Travellab",
            )
            self.stdout.write(self.style.SUCCESS("Created superuser admin / admin"))
            return

        user.username = "admin"
        user.email = "admin@travellab.az"
        user.set_password("admin")
        user.is_staff = True
        user.is_superuser = True
        user.is_active = True
        user.save()
        self.stdout.write(self.style.SUCCESS("Updated superuser admin / admin"))
