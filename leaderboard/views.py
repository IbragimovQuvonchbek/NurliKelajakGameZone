from django.shortcuts import render, get_object_or_404
from django.db.models import Max
from games.models import Game, GameScore
import logging

logger = logging.getLogger(__name__)


def leaderboards_home(request):
    games = Game.objects.filter(is_active=True)
    return render(request, 'leaderboard/leaderboards_home.html', {
        'games': games  # Changed from 'leaderboards' to 'games' to match template
    })


def game_leaderboard(request, game_slug):
    game = get_object_or_404(Game, slug=game_slug)
    leaderboard = GameScore.objects.filter(game=game).values('user__username').annotate(
        max_score=Max('score')
    ).order_by('-max_score')[:10]  # Limit to top 10 scores
    logger.info(f"Leaderboard accessed for game {game_slug}")
    return render(request, 'leaderboard/game_leaderboard.html', {
        'game': game,
        'leaderboard': leaderboard
    })
