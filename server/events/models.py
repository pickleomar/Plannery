from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class Category(models.Model):
    name  = models.CharField(max_length=50, unique=True )
    is_approved= models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} , ({self.is_approved})"

class Provider(models.Model): 
    class APISource(models.TextChoices):
        YELP = "YELP", _("Yelp")
        GOOGLE = "GOOGLE", _("Google")
    name= models.CharField(max_length=100)
    api_source = models.CharField(max_length=10, choices=APISource.choices)
    external_id = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.name} ({self.api_source})"

class Event(models.Model):
    title = models.CharField(max_length=200)
    category= models.ForeignKey(Category, on_delete=models.PROTECT)
    organizer = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete= models.CASCADE)
    budget= models.IntegerField()
    start_date = models.DateTimeField()

    def __str__(self):
        return self.title

class Checklist(models.Model):
    event= models.OneToOneField(Event, on_delete= models.CASCADE, related_name="checklist")
    tasks = models.JSONField(default=list)

    def __self__(self):
        return f"Checklist for {self.event.title}"