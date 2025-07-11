from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import Game, GameScore
import logging

# Set up logging
logger = logging.getLogger(__name__)


def home(request):
    games = Game.objects.filter(is_active=True)
    return render(request, 'games/home.html', {'games': games})


@login_required
def game_detail(request, game_slug):
    game = get_object_or_404(Game, slug=game_slug)
    template_name = f'games/{game_slug}/{game_slug}.html'
    return render(request, template_name, {'game': game})


@login_required
def save_score(request, game_slug):
    if request.method == 'POST':
        try:
            game = get_object_or_404(Game, slug=game_slug)
            score = request.POST.get('score', '0')
            score = int(score)  # Convert to integer
            if score < 0:
                logger.error(f"Invalid score {score} for game {game_slug}, user {request.user.username}")
                return redirect('games:home')
            GameScore.objects.create(
                user=request.user,
                game=game,
                score=score
            )
            logger.info(f"Score {score} saved for game {game_slug}, user {request.user.username}")
            return redirect('leaderboard:game_leaderboard', game_slug=game_slug)
        except (ValueError, Game.DoesNotExist) as e:
            logger.error(f"Error saving score for game {game_slug}, user {request.user.username}: {str(e)}")
            return redirect('games:home')
    else:
        logger.warning(f"Non-POST request to save_score for game {game_slug}, user {request.user.username}")
        return redirect('games:home')
