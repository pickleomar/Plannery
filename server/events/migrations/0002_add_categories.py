from django.db import migrations

def add_categories(apps, schema_editor):
    # Get the Category model from the app registry
    Category = apps.get_model('events', 'Category')
    
    # List of predefined categories
    categories = [
        'Music',
        'Food & Drink',
        'Business',
        'Sports',
        'Education',
        'Arts',
        'Technology',
        'Health',
        'Travel',
        'Fashion',
        'Film & Media',
        'Gaming',
        'Community',
        'Charity',
        'Religious',
        'Politics',
        'Science',
        'Family',
        'Pets',
        'Outdoors',
        'Nightlife',
        'Performing Arts',
        'Culture',
        'Holiday'
    ]
    
    # Create categories (only if they don't exist)
    for category_name in categories:
        Category.objects.get_or_create(
            name=category_name,
            defaults={'is_approved': True}
        )


def remove_categories(apps, schema_editor):
    # Function to reverse the migration if needed
    Category = apps.get_model('events', 'Category')
    Category.objects.filter(name__in=[
        'Music',
        'Food & Drink',
        'Business',
        'Sports',
        'Education',
        'Arts',
        'Technology',
        'Health',
        'Travel',
        'Fashion',
        'Film & Media',
        'Gaming',
        'Community',
        'Charity',
        'Religious',
        'Politics',
        'Science',
        'Family',
        'Pets',
        'Outdoors',
        'Nightlife',
        'Performing Arts',
        'Culture',
        'Holiday'
    ]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('events', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(add_categories, remove_categories),
    ] 