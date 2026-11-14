from rest_framework import serializers

from .models import ContactMessage, Partner


class PartnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Partner
        fields = "__all__"


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ("id", "name", "email", "phone", "subject", "message", "source", "created_at")
        read_only_fields = ("id", "created_at")
