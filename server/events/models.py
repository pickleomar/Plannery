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
        RAPIDAPI = "RAPIDAPI", _("RapidAPI")
        
    name = models.CharField(max_length=100)
    api_source = models.CharField(max_length=10, choices=APISource.choices)
    external_id = models.CharField(max_length=100, blank=True)
    address = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    website = models.URLField(blank=True)
    rating = models.FloatField(default=0.0)
    review_count = models.IntegerField(default=0)
    coordinates = models.JSONField(default=dict, blank=True)
    description = models.TextField(blank=True)
    tags = models.JSONField(default=list, blank=True)
    provider_type = models.CharField(max_length=100, blank=True)
    
    def __str__(self):
        return f"{self.name} ({self.api_source})"

class Event(models.Model):
    title = models.CharField(max_length=200)
    category = models.ForeignKey(Category, on_delete=models.PROTECT)
    organizer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    budget = models.IntegerField()
    start_date = models.DateTimeField()
    location = models.JSONField(default=dict)  # Store location data as JSON
    expected_attendance = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)

    def __str__(self):
        return self.title

class Checklist(models.Model):
    event= models.OneToOneField(Event, on_delete= models.CASCADE, related_name="checklist")
    tasks = models.JSONField(default=list)

    def __self__(self):
        return f"Checklist for {self.event.title}"

class EventProvider(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='providers')
    provider = models.ForeignKey(Provider, on_delete=models.CASCADE)
    selected_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    selected_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ('contacted', 'Contacted'),
            ('pending', 'Pending'),
            ('confirmed', 'Confirmed'),
            ('canceled', 'Canceled')
        ],
        default='pending'
    )
    price_quote = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    class Meta:
        unique_together = ['event', 'provider']
        
    def __str__(self):
        return f"{self.provider.name} for {self.event.title}"