from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class PaymentResult:
    success: bool
    provider_ref: str
    status: str
    raw: dict | None = None
    message: str = ""


class PaymentProvider(ABC):
    name: str = "base"

    @abstractmethod
    def create_payment(self, amount, currency: str, metadata: dict | None = None) -> PaymentResult:
        raise NotImplementedError

    @abstractmethod
    def confirm_payment(self, provider_ref: str) -> PaymentResult:
        raise NotImplementedError
