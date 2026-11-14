from django.conf import settings

from .demo import DemoPaymentProvider


def get_payment_provider():
    """Return active payment provider. Real providers can be wired here later."""
    if getattr(settings, "DEMO_MODE", True):
        return DemoPaymentProvider()
    return DemoPaymentProvider()
