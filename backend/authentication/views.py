
from django.contrib.auth import authenticate

from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import CreateAgentSerializer
from .permissions import IsAdminRole


# Login View
class LoginView(APIView):

    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):

        username = request.data.get("username")
        password = request.data.get("password")

        # Check username and password
        user = authenticate(
            username=username,
            password=password
        )

        if user:

            # Generate JWT tokens
            refresh_token = RefreshToken.for_user(user)
            access_token = refresh_token.access_token

            data = {
                "access": str(access_token),
                "refresh": str(refresh_token),
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "role": user.role
                }
            }

            return Response(data, status=status.HTTP_200_OK)

        data = {
            "msg": "Invalid username or password"
        }

        return Response(data, status=status.HTTP_400_BAD_REQUEST)


# Logout View
class LogoutView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):

        data = {
            "message": "Logged out successfully. Discard your tokens."
        }

        return Response(data, status=status.HTTP_200_OK)


# Profile View
class ProfileView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):

        user = request.user

        data = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role
        }

        return Response(data, status=status.HTTP_200_OK)


# Create Support Agent View
class CreateAgentView(APIView):

    permission_classes = [IsAdminRole]

    def post(self, request, *args, **kwargs):

        serializer = CreateAgentSerializer(data=request.data)

        if serializer.is_valid():

            user = serializer.save()

            data = {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": "SUPPORT_AGENT"
            }

            return Response(
                data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
