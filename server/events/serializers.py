from rest_framework import serializers
from .models import Event, Category, Checklist


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']


class ChecklistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Checklist
        fields = ['id', 'tasks']


class EventSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    organizer_name = serializers.CharField(source='organizer.username', read_only=True)
    
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'category', 'category_name', 
            'organizer', 'organizer_name', 'budget', 
            'start_date', 'location'
        ]
        read_only_fields = ['organizer']
        
    def validate_budget(self, value):
        if value < 0:
            raise serializers.ValidationError("Budget cannot be negative")
        return value
        
    def validate_start_date(self, value):
        import datetime
        if value < datetime.datetime.now(datetime.timezone.utc):
            raise serializers.ValidationError("Event cannot be scheduled in the past")
        return value 