from django.db import models
from django.conf import settings  # Use this instead of get_user_model()
from django.utils.text import slugify
import os


def game_image_upload_path(instance, filename):
    """Generate upload path for game images"""
    return f'games/{instance.slug}/{filename}'


class Game(models.Model):
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]
    CATEGORY_CHOICES = [
        ('math', 'Math'),
        ('geography', 'Geography'),
        ('memory', 'Memory'),
        ('word', 'Word/Language'),
        ('puzzle', 'Puzzle'),
        ('history', 'History'),
    ]

    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    description_uzbek = models.TextField(blank=True, help_text="Uzbek description of the game")
    image = models.ImageField(
        upload_to=game_image_upload_path,
        null=True,
        blank=True,
        help_text="Upload game cover image (optimal size: 800x600px)"
    )
    is_active = models.BooleanField(default=True)
    difficulty_level = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, null=True, blank=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, null=True, blank=True)
    icon = models.CharField(max_length=50, default='fa-gamepad', help_text="Font Awesome icon class")

    def save(self, *args, **kwargs):
        """Auto-generate slug if not provided"""
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        """Delete associated image when game is deleted"""
        if self.image:
            if os.path.isfile(self.image.path):
                os.remove(self.image.path)
        super().delete(*args, **kwargs)

    def __str__(self):
        return self.name


class GameScore(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    game = models.ForeignKey('Game', on_delete=models.CASCADE)
    score = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-score']
        verbose_name = 'Game Score'
        verbose_name_plural = 'Game Scores'

    def __str__(self):
        return f"{self.user.username} - {self.game.name}: {self.score}"
