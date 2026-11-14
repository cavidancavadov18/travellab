from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.labpoint.models import LabpointWallet

from .models import Profile, User


@receiver(post_save, sender=User)
def create_user_related(sender, instance, created, **kwargs):
    if created:
        Profile.objects.get_or_create(user=instance)
        LabpointWallet.objects.get_or_create(user=instance)
