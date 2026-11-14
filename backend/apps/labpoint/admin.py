from django.contrib import admin

from .models import LabpointTransaction, LabpointWallet


class LabpointTransactionInline(admin.TabularInline):
    model = LabpointTransaction
    extra = 0
    readonly_fields = ("tx_type", "amount", "balance_after", "description", "booking_reference", "created_at")


@admin.register(LabpointWallet)
class LabpointWalletAdmin(admin.ModelAdmin):
    list_display = ("user", "balance", "lifetime_earned", "lifetime_redeemed")
    search_fields = ("user__email",)
    inlines = [LabpointTransactionInline]


@admin.register(LabpointTransaction)
class LabpointTransactionAdmin(admin.ModelAdmin):
    list_display = ("wallet", "tx_type", "amount", "balance_after", "created_at")
    list_filter = ("tx_type",)
