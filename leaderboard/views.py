from django.shortcuts import render, get_object_or_404
from django.db.models import Max
from games.models import Game, GameScore
import logging
from datetime import datetime, timedelta
from django.utils import timezone

logger = logging.getLogger(__name__)


def leaderboards_home(request):
    games = Game.objects.filter(is_active=True)
    return render(request, 'leaderboard/leaderboards_home.html', {
        'games': games  # Changed from 'leaderboards' to 'games' to match template
    })


def game_leaderboard(request, game_slug):
    game = get_object_or_404(Game, slug=game_slug)

    # Get filter parameter from request
    time_filter = request.GET.get('filter', 'all')

    # Base queryset
    queryset = GameScore.objects.filter(game=game)

    # Apply time filters
    today = timezone.now().date()
    if time_filter == 'month':
        first_day = today.replace(day=1)
        queryset = queryset.filter(created_at__gte=first_day)
    elif time_filter == 'week':
        monday = today - timedelta(days=today.weekday())
        queryset = queryset.filter(created_at__gte=monday)
    elif time_filter == 'day':
        queryset = queryset.filter(created_at__date=today)

    # Get leaderboard data
    leaderboard = queryset.values(
        'user__username',
        'user__avatar'
    ).annotate(
        max_score=Max('score'),
        latest_score_date=Max('created_at')
    ).order_by('-max_score')[:10]

    return render(request, 'leaderboard/game_leaderboard.html', {
        'game': game,
        'leaderboard': leaderboard,
        'active_filter': time_filter
    })
