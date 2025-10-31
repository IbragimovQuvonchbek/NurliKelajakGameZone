from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from .models import Game, GameScore, UserGameStatus, GameChallenge, ShareableScore
from accounts.models import User
import logging
import uuid
from datetime import datetime, timedelta

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

            # Check and unlock achievements
            try:
                from accounts.services import check_and_unlock_achievements
                unlocked = check_and_unlock_achievements(request.user, score=score)
                if unlocked:
                    logger.info(f"User {request.user.username} unlocked {len(unlocked)} achievements")
            except Exception as e:
                logger.error(f"Error checking achievements: {str(e)}")

            return redirect('leaderboard:game_leaderboard', game_slug=game_slug)
        except (ValueError, Game.DoesNotExist) as e:
            logger.error(f"Error saving score for game {game_slug}, user {request.user.username}: {str(e)}")
            return redirect('games:home')
    else:
        logger.warning(f"Non-POST request to save_score for game {game_slug}, user {request.user.username}")
        return redirect('games:home')


# API Endpoints
@login_required
@require_http_methods(["POST"])
def api_send_challenge(request):
    """Create a game challenge"""
    try:
        opponent_id = request.POST.get('opponent_id')
        game_id = request.POST.get('game_id')

        opponent = get_object_or_404(User, id=opponent_id)
        game = get_object_or_404(Game, id=game_id)

        challenge = GameChallenge.objects.create(
            challenger=request.user,
            opponent=opponent,
            game=game
        )

        return JsonResponse({
            'success': True,
            'challenge_id': challenge.id,
            'message': f'Challenge sent to {opponent.username}'
        })
    except Exception as e:
        logger.error(f"Error creating challenge: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=400)


@login_required
@require_http_methods(["POST"])
def api_respond_challenge(request, challenge_id):
    """Accept or decline a challenge"""
    try:
        action = request.POST.get('action')  # 'accept' or 'decline'
        challenge = get_object_or_404(GameChallenge, id=challenge_id)

        if challenge.opponent != request.user:
            return JsonResponse({
                'success': False,
                'error': 'Not authorized to respond to this challenge'
            }, status=403)

        if action == 'accept':
            challenge.status = 'accepted'
            challenge.save()
            return JsonResponse({
                'success': True,
                'message': 'Challenge accepted',
                'game_slug': challenge.game.slug
            })
        elif action == 'decline':
            challenge.status = 'declined'
            challenge.save()
            return JsonResponse({
                'success': True,
                'message': 'Challenge declined'
            })
        else:
            return JsonResponse({
                'success': False,
                'error': 'Invalid action'
            }, status=400)
    except Exception as e:
        logger.error(f"Error responding to challenge: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=400)


@login_required
@require_http_methods(["GET"])
def api_get_pending_challenges(request):
    """Get user's pending challenges"""
    try:
        challenges = GameChallenge.get_user_pending_challenges(request.user)
        data = []
        for challenge in challenges:
            data.append({
                'id': challenge.id,
                'challenger': challenge.challenger.username,
                'game': challenge.game.name,
                'created_at': challenge.created_at.isoformat()
            })
        return JsonResponse({
            'success': True,
            'challenges': data
        })
    except Exception as e:
        logger.error(f"Error getting pending challenges: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=400)


@login_required
@require_http_methods(["POST"])
def api_share_score(request, score_id):
    """Generate a shareable score token"""
    try:
        score = get_object_or_404(GameScore, id=score_id)

        if score.user != request.user:
            return JsonResponse({
                'success': False,
                'error': 'Not authorized to share this score'
            }, status=403)

        # Create shareable score
        share_token = str(uuid.uuid4())[:10]
        shareable_score = ShareableScore.objects.create(
            user=request.user,
            game=score.game,
            score=score.score,
            share_token=share_token,
            expires_at=datetime.now() + timedelta(days=30)
        )

        share_url = f"/share/{share_token}/"

        return JsonResponse({
            'success': True,
            'share_token': share_token,
            'share_url': share_url,
            'message': 'Score sharing link generated'
        })
    except Exception as e:
        logger.error(f"Error sharing score: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=400)


@require_http_methods(["GET"])
def api_view_shared_score(request, share_token):
    """View a publicly shared score"""
    try:
        shareable_score = get_object_or_404(ShareableScore, share_token=share_token)

        # Check if expired
        if shareable_score.expires_at and shareable_score.expires_at < datetime.now():
            return JsonResponse({
                'success': False,
                'error': 'This share link has expired'
            }, status=410)

        return JsonResponse({
            'success': True,
            'player': shareable_score.user.username,
            'game': shareable_score.game.name,
            'score': shareable_score.score,
            'created_at': shareable_score.created_at.isoformat()
        })
    except Exception as e:
        logger.error(f"Error viewing shared score: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=400)


@login_required
@require_http_methods(["GET"])
def api_get_recommended_games(request):
    """Get recommended games for the user"""
    try:
        recommended = Game.get_recommended_games(request.user)[:3]
        games_data = []
        for game in recommended:
            games_data.append({
                'id': game.id,
                'name': game.name,
                'slug': game.slug,
                'description': game.description,
                'category': game.category or 'general',
                'icon': game.icon
            })
        return JsonResponse({
            'success': True,
            'games': games_data
        })
    except Exception as e:
        logger.error(f"Error getting recommended games: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=400)


@login_required
@require_http_methods(["POST"])
def api_mark_tutorial_complete(request, game_id):
    """Mark tutorial as completed for a game"""
    try:
        game = get_object_or_404(Game, id=game_id)

        user_game_status, created = UserGameStatus.objects.get_or_create(
            user=request.user,
            game=game
        )
        user_game_status.tutorial_completed = True
        user_game_status.last_played = datetime.now()
        user_game_status.save()

        return JsonResponse({
            'success': True,
            'message': 'Tutorial marked as completed'
        })
    except Exception as e:
        logger.error(f"Error marking tutorial complete: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=400)
