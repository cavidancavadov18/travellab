import uuid
from decimal import Decimal

from django.db import transaction

from apps.labpoint.services import calculate_earn_from_total, redeem_points, earn_points, points_to_currency
from apps.payments.models import Payment
from apps.payments.providers import get_payment_provider

from .models import Booking


def _ref(prefix="TL"):
    return f"{prefix}{uuid.uuid4().hex[:10].upper()}"


@transaction.atomic
def create_booking(user, data: dict) -> Booking:
    subtotal = Decimal(str(data["subtotal"]))
    quantity = int(data.get("quantity") or 1)
    labpoint_to_redeem = Decimal(str(data.get("labpoint_to_redeem") or 0))
    discount = points_to_currency(labpoint_to_redeem) if labpoint_to_redeem else Decimal("0")
    if discount > subtotal:
        discount = subtotal
        labpoint_to_redeem = (discount / Decimal("0.01")).quantize(Decimal("0.01"))

    total = (subtotal - discount).quantize(Decimal("0.01"))
    reference = _ref()

    if labpoint_to_redeem > 0:
        redeem_points(
            user,
            labpoint_to_redeem,
            description=f"Redeemed for booking {reference}",
            booking_reference=reference,
        )

    booking = Booking.objects.create(
        user=user,
        booking_type=data["booking_type"],
        status="pending",
        reference=reference,
        title=data["title"],
        details=data.get("details") or {},
        passengers=data.get("passengers") or [],
        quantity=quantity,
        subtotal=subtotal,
        labpoint_redeemed=labpoint_to_redeem,
        labpoint_earned=Decimal("0"),
        total=total,
        currency=data.get("currency") or "USD",
        contact_email=data["contact_email"],
        contact_phone=data.get("contact_phone") or "",
        notes=data.get("notes") or "",
        related_object_id=data.get("related_object_id"),
    )

    if data.get("pay_now", True):
        provider = get_payment_provider()
        result = provider.create_payment(total, booking.currency, {"booking": reference})
        payment = Payment.objects.create(
            user=user,
            booking_reference=reference,
            provider=provider.name,
            status="processing" if result.success else "failed",
            amount=total,
            currency=booking.currency,
            provider_ref=result.provider_ref,
            meta=result.raw or {},
        )
        confirm = provider.confirm_payment(result.provider_ref)
        if confirm.success:
            payment.status = "succeeded"
            payment.save(update_fields=["status", "updated_at"])
            earned = calculate_earn_from_total(total)
            booking.status = "paid"
            booking.labpoint_earned = earned
            booking.save(update_fields=["status", "labpoint_earned", "updated_at"])
            if earned > 0:
                earn_points(
                    user,
                    earned,
                    description=f"Earned from booking {reference}",
                    booking_reference=reference,
                )
        else:
            booking.status = "failed"
            booking.save(update_fields=["status", "updated_at"])
    else:
        booking.status = "confirmed"
        booking.save(update_fields=["status", "updated_at"])

    return booking
