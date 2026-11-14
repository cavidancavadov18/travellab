from rest_framework import serializers

from .models import LabpointTransaction, LabpointWallet


class LabpointWalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabpointWallet
        fields = ("balance", "lifetime_earned", "lifetime_redeemed", "updated_at")


class LabpointTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabpointTransaction
        fields = ("id", "tx_type", "amount", "balance_after", "description", "booking_reference", "created_at")


class RedeemSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    description = serializers.CharField(required=False, allow_blank=True)
