from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import LoginView,LogoutView,ProfileView,CreateAgentView
urlpatterns=[path("login/",LoginView.as_view()),path("logout/",LogoutView.as_view()),
path("profile/",ProfileView.as_view()),path("create-agent/",CreateAgentView.as_view()),
path("token/refresh/",TokenRefreshView.as_view())]
