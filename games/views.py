from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import Game, GameScore


def home(request):
    games = Game.objects.filter(is_active=True)
    return render(request, 'games/home.html', {'games': games})


@login_required
def game_detail(request, game_slug):
    game = get_object_or_404(Game, slug=game_slug)
    # Update to match your folder structure
    template_name = f'games/{game_slug}/{game_slug}.html'
    return render(request, template_name, {'game': game})

@login_required
def save_score(request, game_slug):
    if request.method == 'POST':
        game = Game.objects.get(slug=game_slug)
        score = int(request.POST.get('score', 0))

        GameScore.objects.create(
            user=request.user,
            game=game,
            score=score
        )

        return redirect('leaderboard:game_leaderboard', game_slug=game_slug)
    return redirect('games:home')