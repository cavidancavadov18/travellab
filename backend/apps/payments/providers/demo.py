import uuid

from .base import PaymentProvider, PaymentResult


class DemoPaymentProvider(PaymentProvider):
    name = "demo"

    def create_payment(self, amount, currency: str, metadata: dict | None = None) -> PaymentResult:
        ref = f"demo_{uuid.uuid4().hex[:16]}"
        return PaymentResult(
            success=True,
            provider_ref=ref,
            status="processing",
            raw={"amount": str(amount), "currency": currency, "metadata": metadata or {}},
            message="Demo payment created",
        )

    def confirm_payment(self, provider_ref: str) -> PaymentResult:
        return PaymentResult(
            success=True,
            provider_ref=provider_ref,
            status="succeeded",
            raw={"provider_ref": provider_ref},
            message="Demo payment succeeded",
        )
