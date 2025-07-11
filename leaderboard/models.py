from django.db import models
from games.models import Game


class Leaderboard(models.Model):
    game = models.OneToOneField(Game, on_delete=models.CASCADE, related_name='leaderboard')
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Leaderboard for {self.game.name}"

    def top_scores(self, limit=10):
        return self.game.gamescore_set.values('user__username').annotate(
            max_score=models.Max('score')
        ).order_by('-max_score')[:limit]
