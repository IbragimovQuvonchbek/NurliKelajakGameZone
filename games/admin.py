from django.contrib import admin
from .models import Game, GameScore
from django.utils.html import format_html


@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'image_preview', 'is_active')
    list_editable = ('is_active',)
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ('image_preview',)

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-height: 100px;"/>', obj.image.url)
        return "No image"

    image_preview.short_description = 'Preview'


@admin.register(GameScore)
class GameScoreAdmin(admin.ModelAdmin):
    list_display = ('user', 'game', 'score', 'created_at')
    list_filter = ('game', 'created_at')
    search_fields = ('user__username', 'game__name')