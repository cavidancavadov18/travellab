from decimal import Decimal

from django.conf import settings
from django.db import transaction

from .models import LabpointTransaction, LabpointWallet


def get_or_create_wallet(user):
    wallet, _ = LabpointWallet.objects.get_or_create(user=user)
    return wallet


@transaction.atomic
def earn_points(user, amount, description="", booking_reference=""):
    wallet = get_or_create_wallet(user)
    amount = Decimal(str(amount))
    if amount <= 0:
        return wallet
    wallet.balance += amount
    wallet.lifetime_earned += amount
    wallet.save(update_fields=["balance", "lifetime_earned", "updated_at"])
    LabpointTransaction.objects.create(
        wallet=wallet,
        tx_type="earn",
        amount=amount,
        balance_after=wallet.balance,
        description=description or "Points earned",
        booking_reference=booking_reference,
    )
    return wallet


@transaction.atomic
def redeem_points(user, amount, description="", booking_reference=""):
    wallet = get_or_create_wallet(user)
    amount = Decimal(str(amount))
    if amount <= 0:
        raise ValueError("Redeem amount must be positive")
    if wallet.balance < amount:
        raise ValueError("Insufficient Labpoint balance")
    wallet.balance -= amount
    wallet.lifetime_redeemed += amount
    wallet.save(update_fields=["balance", "lifetime_redeemed", "updated_at"])
    LabpointTransaction.objects.create(
        wallet=wallet,
        tx_type="redeem",
        amount=amount,
        balance_after=wallet.balance,
        description=description or "Points redeemed",
        booking_reference=booking_reference,
    )
    return wallet


def calculate_earn_from_total(total):
    rate = Decimal(str(getattr(settings, "LABPOINT_EARN_RATE", 0.02)))
    return (Decimal(str(total)) * rate).quantize(Decimal("0.01"))


def points_to_currency(points):
    value = Decimal(str(getattr(settings, "LABPOINT_REDEEM_VALUE", 0.01)))
    return (Decimal(str(points)) * value).quantize(Decimal("0.01"))
