from django.db import models
from games.models import Game, GameScore


class Leaderboard(models.Model):
    game = models.OneToOneField(Game, on_delete=models.CASCADE, related_name='leaderboard')

    def __str__(self):
        return f"Leaderboard for {self.game.name}"

    def top_scores(self, limit=10):
        return GameScore.objects.filter(game=self.game).order_by('-score')[:limit]