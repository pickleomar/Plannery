from django.contrib.auth.models import AbstractUser, UserManager
from django.db import models
from django.utils.translation import gettext_lazy as _
import uuid

class CustomUserManagement(UserManager):
    def create_superuser(self,email,username,password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'ADMIN')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self._create_user(username, email, password, **extra_fields)
class User(AbstractUser):
    class Role(models.TextChoices):
        ORGANIZER = "ORGANIZER", _("Organizer")
        ADMIN = "ADMIN" , _("Admin")
    class OAuthProvider(models.TextChoices):
        GOOGLE = "GOOGLE", _("Google")
        FACEBOOK = "FACEBOOK", _("Facebook")
    
    id= models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username= models.CharField(max_length=20,unique=True)
    email= models.EmailField(_("email adress"),unique=True)
    role= models.CharField(max_length=10, choices= Role.choices, default= Role.ORGANIZER )

    oauth_provider= models.CharField(max_length=10, choices= OAuthProvider.choices, null=True ,blank =True)

    USERNAME_FIELD= "email"
    objects = CustomUserManagement()
    #additional fields required for creating a superuser
    REQUIRED_FIELDS= ['username']
    
    def __str__(self):
        return self.email
