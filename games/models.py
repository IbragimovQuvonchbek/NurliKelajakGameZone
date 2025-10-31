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

    @classmethod
    def get_recommended_games(cls, user):
        """Return games the user hasn't played yet"""
        from django.db.models import Q
        played_games = GameScore.objects.filter(user=user).values_list('game_id', flat=True)
        return cls.objects.filter(is_active=True).exclude(id__in=played_games)

    @classmethod
    def get_game_by_slug(cls, slug):
        """Get game by slug"""
        try:
            return cls.objects.get(slug=slug)
        except cls.DoesNotExist:
            return None


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


class UserGameStatus(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='game_statuses')
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    tutorial_completed = models.BooleanField(default=False)
    last_played = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'game']
        verbose_name = 'User Game Status'
        verbose_name_plural = 'User Game Statuses'

    def __str__(self):
        return f"{self.user.username} - {self.game.name}"


class GameChallenge(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('completed', 'Completed'),
        ('declined', 'Declined'),
    ]

    challenger = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='challenges_sent')
    opponent = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='challenges_received')
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    challenger_score = models.PositiveIntegerField(null=True, blank=True)
    opponent_score = models.PositiveIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'Game Challenge'
        verbose_name_plural = 'Game Challenges'
        ordering = ['-created_at']

    def __str__(self):
        return f"Challenge: {self.challenger.username} vs {self.opponent.username} - {self.game.name}"

    @classmethod
    def get_user_pending_challenges(cls, user):
        """Get pending challenges for a user"""
        return cls.objects.filter(opponent=user, status='pending')


class ShareableScore(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='shared_scores')
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    score = models.PositiveIntegerField()
    share_token = models.CharField(max_length=50, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'Shareable Score'
        verbose_name_plural = 'Shareable Scores'
        ordering = ['-created_at']

    def __str__(self):
        return f"Score share: {self.user.username} - {self.game.name}: {self.score}"
