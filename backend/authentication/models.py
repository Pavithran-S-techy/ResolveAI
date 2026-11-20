
from django.db import models
from django.contrib.auth.models import AbstractUser


class UserProfile(AbstractUser):

    ROLE_CHOICES = [
        ("ADMIN", "Admin"),
        ("SUPPORT_AGENT", "Support Agent"),
    ]

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="SUPPORT_AGENT"
    )

    class Meta:

        verbose_name = 'User Profile'

        verbose_name_plural = 'User Profile'

    def __str__(self):
        return f"{self.username} - {self.role}"
