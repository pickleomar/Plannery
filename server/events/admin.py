from django.contrib import admin
from .models import Event, Category, Provider, Checklist

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_approved')
    list_filter = ('is_approved',)
    search_fields = ('name',)

@admin.register(Provider)
class ProviderAdmin(admin.ModelAdmin):
    list_display = ('name', 'api_source', 'external_id')
    list_filter = ('api_source',)
    search_fields = ('name', 'external_id')

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'organizer', 'budget', 'start_date', 'expected_attendance')
    list_filter = ('category', 'start_date')
    search_fields = ('title', 'organizer__username', 'organizer__email')
    date_hierarchy = 'start_date'
    readonly_fields = ('created_at', 'updated_at')

@admin.register(Checklist)
class ChecklistAdmin(admin.ModelAdmin):
    list_display = ('event',)
    search_fields = ('event__title',)
