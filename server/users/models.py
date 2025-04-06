from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _
import uuid


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
    
    #Choose additional fields required for creating a superuser
    REQUIRED_FIELDS= []
    
    def __str__(self):
        return self.email
