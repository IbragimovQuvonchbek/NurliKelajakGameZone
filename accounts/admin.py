from django.contrib import admin
from .models import User, Achievement, UserAchievement

# Register your models here.

admin.site.register(User)


@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ['title', 'achievement_type', 'requirement']
    list_filter = ['achievement_type']
    search_fields = ['title', 'description']


@admin.register(UserAchievement)
class UserAchievementAdmin(admin.ModelAdmin):
    list_display = ['user', 'achievement', 'unlocked_at']
    list_filter = ['unlocked_at', 'achievement']
    search_fields = ['user__username', 'achievement__title']
    date_hierarchy = 'unlocked_at'
