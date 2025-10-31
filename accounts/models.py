from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    bio = models.TextField(max_length=500, blank=True)

    # Fix for the groups/permissions clash
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_set',
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_set',
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )

    def __str__(self):
        return self.username


class Achievement(models.Model):
    ACHIEVEMENT_TYPES = [
        ('FIRST_PLAY', 'First Play'),
        ('SCORE_1000', 'Score 1000 Points'),
        ('TOP_10', 'Top 10 Player'),
        ('STREAK_MASTER', 'Streak Master'),
        ('ALL_GAMES', 'All Games Played'),
        ('GAME_WINNER', 'Game Winner'),
    ]
    
    title = models.CharField(max_length=100)
    description = models.TextField(max_length=500)
    icon = models.CharField(max_length=50, default='fa-trophy')
    achievement_type = models.CharField(max_length=50, choices=ACHIEVEMENT_TYPES, unique=True)
    requirement = models.IntegerField(help_text="Required value to unlock (e.g., 1000 for score, 10 for streak)")
    
    class Meta:
        ordering = ['id']
        verbose_name = 'Achievement'
        verbose_name_plural = 'Achievements'
    
    def __str__(self):
        return self.title


class UserAchievement(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_achievements')
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    unlocked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'achievement']
        ordering = ['-unlocked_at']

    def __str__(self):
        return f"{self.user.username} - {self.achievement.title}"


class UserSettings(models.Model):
    THEME_CHOICES = [
        ('auto', 'Auto (System preference)'),
        ('light', 'Light Mode'),
        ('dark', 'Dark Mode'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='settings')
    theme_mode = models.CharField(max_length=10, choices=THEME_CHOICES, default='auto')
    high_contrast_enabled = models.BooleanField(default=False)
    keyboard_navigation_hints = models.BooleanField(default=True)
    screen_reader_mode = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'User Settings'
        verbose_name_plural = 'User Settings'

    def __str__(self):
        return f"Settings for {self.user.username}"


class UserFollowing(models.Model):
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='following')
    following = models.ForeignKey(User, on_delete=models.CASCADE, related_name='followers')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['follower', 'following']
        verbose_name = 'User Following'
        verbose_name_plural = 'User Followings'

    def __str__(self):
        return f"{self.follower.username} follows {self.following.username}"
