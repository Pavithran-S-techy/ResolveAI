
from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class CreateAgentSerializer(serializers.Serializer):

    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True,
        min_length=8
    )

    def validate_username(self, v):

        if User.objects.filter(username=v).exists():
            raise serializers.ValidationError(
                "Username already exists."
            )

        return v

    def create(self, data):

        return User.objects.create_user(
            username=data["username"],
            email=data["email"],
            password=data["password"],
            role="SUPPORT_AGENT"
        )
