from django.conf import settings
from django.db import models
class UserProfile(models.Model):
    ROLE_CHOICES=[("ADMIN","Admin"),("SUPPORT_AGENT","Support Agent")]
    user=models.OneToOneField(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name="profile")
    role=models.CharField(max_length=20,choices=ROLE_CHOICES,default="SUPPORT_AGENT")
    def __str__(self): return f"{self.user.username} - {self.role}"
