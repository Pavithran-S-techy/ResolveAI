from rest_framework.views import APIView
from rest_framework.permissions import AllowAny,IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import LoginSerializer,CreateAgentSerializer
from .models import UserProfile
from .permissions import IsAdminRole
class LoginView(APIView):
    permission_classes=[AllowAny]
    def post(self,request):
        s=LoginSerializer(data=request.data); s.is_valid(raise_exception=True)
        user=s.validated_data["user"]
        profile,created=UserProfile.objects.get_or_create(user=user,defaults={"role":"ADMIN" if user.is_superuser else "SUPPORT_AGENT"})
        token=RefreshToken.for_user(user)
        return Response({"access":str(token.access_token),"refresh":str(token),
        "user":{"id":user.id,"username":user.username,"email":user.email,"role":profile.role}})
class LogoutView(APIView):
    permission_classes=[IsAuthenticated]
    def post(self,request):
        return Response({"message":"Logged out on the client. Discard the access and refresh tokens."})
class ProfileView(APIView):
    permission_classes=[IsAuthenticated]
    def get(self,request):
        p,_=UserProfile.objects.get_or_create(user=request.user,defaults={"role":"ADMIN" if request.user.is_superuser else "SUPPORT_AGENT"})
        return Response({"id":request.user.id,"username":request.user.username,"email":request.user.email,"role":p.role})
class CreateAgentView(APIView):
    permission_classes=[IsAdminRole]
    def post(self,request):
        s=CreateAgentSerializer(data=request.data); s.is_valid(raise_exception=True); u=s.save()
        return Response({"id":u.id,"username":u.username,"email":u.email,"role":"SUPPORT_AGENT"},status=status.HTTP_201_CREATED)
