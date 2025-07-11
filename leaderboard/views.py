from django.shortcuts import render, get_object_or_404
from games.models import Game


def leaderboards_home(request):
    games = Game.objects.filter(is_active=True)
    return render(request, 'leaderboard/leaderboards_home.html', {
        'games': games,
    })


def game_leaderboard(request, game_slug):
    game = get_object_or_404(Game, slug=game_slug)
    scores = game.gamescore_set.order_by('-score')[:10]
    return render(request, 'leaderboard/game_leaderboard.html', {
        'game': game,
        'scores': scores,
    })
