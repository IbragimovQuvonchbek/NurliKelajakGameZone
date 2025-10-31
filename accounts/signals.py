from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, UserSettings


@receiver(post_save, sender=User)
def create_user_settings(sender, instance, created, **kwargs):
    """Create UserSettings when a new user is created"""
    if created:
        UserSettings.objects.get_or_create(user=instance)


@receiver(post_save, sender=User)
def save_user_settings(sender, instance, **kwargs):
    """Save UserSettings when user is saved"""
    if hasattr(instance, 'settings'):
        instance.settings.save()
