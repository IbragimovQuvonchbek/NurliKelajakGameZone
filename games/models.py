from django.db import models
from django.contrib.auth import get_user_model
from django.utils.text import slugify
import os

User = get_user_model()


def game_image_upload_path(instance, filename):
    """Generate upload path for game images"""
    return f'games/{instance.slug}/{filename}'


class Game(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    image = models.ImageField(
        upload_to=game_image_upload_path,
        null=True,
        blank=True,
        help_text="Upload game cover image (optimal size: 800x600px)"
    )
    is_active = models.BooleanField(default=True)

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
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    score = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-score']
        verbose_name = 'Game Score'
        verbose_name_plural = 'Game Scores'

    def __str__(self):
        return f"{self.user.username} - {self.game.name}: {self.score}"