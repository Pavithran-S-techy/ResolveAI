from django.contrib.auth import authenticate,get_user_model
from rest_framework import serializers
from .models import UserProfile
User=get_user_model()
class LoginSerializer(serializers.Serializer):
    username=serializers.CharField()
    password=serializers.CharField(write_only=True,trim_whitespace=False)
    def validate(self,attrs):
        user=authenticate(username=attrs["username"],password=attrs["password"])
        if not user or not user.is_active: raise serializers.ValidationError("Invalid username or password.")
        attrs["user"]=user
        return attrs
class CreateAgentSerializer(serializers.Serializer):
    username=serializers.CharField(max_length=150)
    email=serializers.EmailField()
    password=serializers.CharField(write_only=True,min_length=8)
    def validate_username(self,v):
        if User.objects.filter(username=v).exists(): raise serializers.ValidationError("Username already exists.")
        return v
    def create(self,data):
        user=User.objects.create_user(username=data["username"],email=data["email"],password=data["password"])
        UserProfile.objects.create(user=user,role="SUPPORT_AGENT")
        return user
