from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import Profile

User = get_user_model()


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ("phone", "locale", "avatar", "city")


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    labpoint_balance = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "first_name",
            "last_name",
            "is_staff",
            "profile",
            "labpoint_balance",
        )

    def get_labpoint_balance(self, obj):
        wallet = getattr(obj, "labpoint_wallet", None)
        return str(wallet.balance) if wallet else "0.00"


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    locale = serializers.ChoiceField(choices=["az", "en", "ru"], default="az")

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Email already registered")
        return value.lower()

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        phone = validated_data.pop("phone", "")
        locale = validated_data.pop("locale", "az")
        user = User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
        )
        profile = user.profile
        profile.phone = phone
        profile.locale = locale
        profile.save()
        return user


class ProfileUpdateSerializer(serializers.Serializer):
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    locale = serializers.ChoiceField(choices=["az", "en", "ru"], required=False)
    city = serializers.CharField(required=False, allow_blank=True)

    def update(self, instance, validated_data):
        for field in ("first_name", "last_name"):
            if field in validated_data:
                setattr(instance, field, validated_data[field])
        instance.save()
        profile = instance.profile
        for field in ("phone", "locale", "city"):
            if field in validated_data:
                setattr(profile, field, validated_data[field])
        profile.save()
        return instance
