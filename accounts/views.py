from django.http import Http404, JsonResponse
from django.shortcuts import render, redirect
from django.contrib.auth import login
from .forms import CustomUserCreationForm
from django.contrib.auth import logout
from django.views.decorators.http import require_http_methods
from .forms import AvatarUploadForm, PasswordChangeForm
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.contrib.auth import update_session_auth_hash
from .services import get_user_stats
from datetime import datetime, timedelta
from games.models import GameScore, GameChallenge, UserGameStatus
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.db.models import Sum
from .models import UserFollowing, UserSettings


def signup(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('games:home')
    else:
        form = CustomUserCreationForm()
    return render(request, 'accounts/signup.html', {'form': form})


@require_http_methods(["GET"])
def custom_logout(request):
    logout(request)
    return redirect('games:home')


@login_required
def profile(request):
    # Calculate total points (sum of all scores)
    total_points = GameScore.objects.filter(user=request.user).aggregate(
        total_points=Sum('score')
    )['total_points'] or 0

    # Calculate daily streak
    streak = 0
    today = datetime.now().date()
    current_date = today
    while GameScore.objects.filter(user=request.user, created_at__date=current_date).exists():
        streak += 1
        current_date -= timedelta(days=1)

    stats = get_user_stats(request.user)
    
    # Get user achievements
    from .models import UserAchievement
    user_achievements = UserAchievement.objects.filter(user=request.user).select_related('achievement')

    context = {
        'games_played_count': stats['games_played_count'],
        'ranked_games_count': stats['ranked_games_count'],
        'daily_streak': streak,
        'total_points': total_points,
        'game_rankings': stats['game_rankings'],
        'recent_games': stats['recent_games'],
        'achievements': user_achievements
    }
    return render(request, 'accounts/profile.html', context)


@login_required
def upload_avatar(request):
    if request.method == 'POST':
        form = AvatarUploadForm(request.POST, request.FILES, instance=request.user)
        if form.is_valid():
            form.save()
            messages.success(request, 'Avatar updated successfully!')
    return redirect('accounts:profile')


@login_required
def change_password(request):
    if request.method == 'POST':
        form = PasswordChangeForm(request.user, request.POST)
        if form.is_valid():
            user = form.save()
            update_session_auth_hash(request, user)
            messages.success(request, 'Password changed successfully!')
            return redirect('accounts:profile')
    else:
        form = PasswordChangeForm(request.user)
    return render(request, 'accounts/change_password.html', {'form': form})


def user_profile(request, username):
    # Get the User model properly
    UserModel = get_user_model()

    try:
        # Get the user profile we're viewing
        profile_user = get_object_or_404(UserModel, username=username)

        # Calculate total points (sum of all max scores across games)
        total_points = GameScore.objects.filter(user=profile_user).aggregate(
            total=Sum('score')
        )['total'] or 0

        # Calculate daily streak
        streak = 0
        today = datetime.now().date()
        current_date = today

        # Check if user has played today
        while GameScore.objects.filter(user=profile_user, created_at__date=current_date).exists():
            streak += 1
            current_date -= timedelta(days=1)

        # Get other stats from service
        stats = get_user_stats(profile_user)
        
        # Get user achievements
        from .models import UserAchievement
        user_achievements = UserAchievement.objects.filter(user=profile_user).select_related('achievement')

        context = {
            'profile_user': profile_user,
            'games_played_count': stats['games_played_count'],
            'ranked_games_count': stats['ranked_games_count'],
            'daily_streak': streak,
            'total_points': total_points,
            'game_rankings': stats['game_rankings'],
            'recent_games': stats['recent_games'],
            'achievements': user_achievements,
            'is_own_profile': (request.user == profile_user)
        }

        return render(request, 'accounts/public_profile.html', context)

    except Exception as e:
        # Log the error for debugging
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error in user_profile view: {str(e)}")

        # Return a 404 page if something goes wrong
        raise Http404("User profile not found")


# API Endpoints for Social Features
@login_required
@require_http_methods(["POST"])
def api_follow_user(request, user_id):
    """Follow a user"""
    try:
        user_to_follow = get_object_or_404(get_user_model(), id=user_id)

        if request.user == user_to_follow:
            return JsonResponse({
                'success': False,
                'error': 'You cannot follow yourself'
            }, status=400)

        # Check if already following
        if UserFollowing.objects.filter(follower=request.user, following=user_to_follow).exists():
            return JsonResponse({
                'success': False,
                'error': 'Already following this user'
            }, status=400)

        UserFollowing.objects.create(
            follower=request.user,
            following=user_to_follow
        )

        return JsonResponse({
            'success': True,
            'message': f'Now following {user_to_follow.username}'
        })
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error following user: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=400)


@login_required
@require_http_methods(["POST"])
def api_unfollow_user(request, user_id):
    """Unfollow a user"""
    try:
        user_to_unfollow = get_object_or_404(get_user_model(), id=user_id)

        following = UserFollowing.objects.filter(
            follower=request.user,
            following=user_to_unfollow
        ).first()

        if not following:
            return JsonResponse({
                'success': False,
                'error': 'Not following this user'
            }, status=400)

        following.delete()

        return JsonResponse({
            'success': True,
            'message': f'Unfollowed {user_to_unfollow.username}'
        })
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error unfollowing user: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=400)


@login_required
@require_http_methods(["GET"])
def api_get_following_list(request):
    """Get list of users the current user follows"""
    try:
        following = UserFollowing.objects.filter(follower=request.user).select_related('following')
        data = []
        for f in following:
            data.append({
                'id': f.following.id,
                'username': f.following.username,
                'avatar': f.following.avatar.url if f.following.avatar else None
            })
        return JsonResponse({
            'success': True,
            'following': data
        })
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error getting following list: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=400)


@login_required
@require_http_methods(["GET"])
def api_get_followers_list(request, user_id):
    """Get list of followers for a user"""
    try:
        user = get_object_or_404(get_user_model(), id=user_id)
        followers = UserFollowing.objects.filter(following=user).select_related('follower')
        data = []
        for f in followers:
            data.append({
                'id': f.follower.id,
                'username': f.follower.username,
                'avatar': f.follower.avatar.url if f.follower.avatar else None
            })
        return JsonResponse({
            'success': True,
            'followers': data
        })
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error getting followers list: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=400)


@login_required
@require_http_methods(["GET"])
def api_get_activity_feed(request):
    """Get activity feed of following users' recent scores and achievements"""
    try:
        # Get users being followed
        following_users = UserFollowing.objects.filter(
            follower=request.user
        ).values_list('following', flat=True)

        # Get recent scores from followed users
        recent_scores = GameScore.objects.filter(
            user_id__in=following_users
        ).select_related('user', 'game').order_by('-created_at')[:20]

        # Get recent achievements from followed users
        from .models import UserAchievement
        recent_achievements = UserAchievement.objects.filter(
            user_id__in=following_users
        ).select_related('user', 'achievement').order_by('-unlocked_at')[:20]

        activity = []

        for score in recent_scores:
            activity.append({
                'type': 'score',
                'user': score.user.username,
                'game': score.game.name,
                'score': score.score,
                'timestamp': score.created_at.isoformat()
            })

        for achievement in recent_achievements:
            activity.append({
                'type': 'achievement',
                'user': achievement.user.username,
                'achievement': achievement.achievement.title,
                'timestamp': achievement.unlocked_at.isoformat()
            })

        # Sort by timestamp
        activity.sort(key=lambda x: x['timestamp'], reverse=True)

        return JsonResponse({
            'success': True,
            'activity': activity[:30]
        })
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error getting activity feed: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=400)


@login_required
@require_http_methods(["POST"])
def api_update_settings(request):
    """Update user settings"""
    try:
        settings_obj, created = UserSettings.objects.get_or_create(user=request.user)

        # Update fields if provided
        if 'theme_mode' in request.POST:
            settings_obj.theme_mode = request.POST.get('theme_mode')
        if 'high_contrast_enabled' in request.POST:
            settings_obj.high_contrast_enabled = request.POST.get('high_contrast_enabled') == 'true'
        if 'keyboard_navigation_hints' in request.POST:
            settings_obj.keyboard_navigation_hints = request.POST.get('keyboard_navigation_hints') == 'true'
        if 'screen_reader_mode' in request.POST:
            settings_obj.screen_reader_mode = request.POST.get('screen_reader_mode') == 'true'

        settings_obj.save()

        return JsonResponse({
            'success': True,
            'message': 'Settings updated successfully'
        })
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error updating settings: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=400)


@login_required
@require_http_methods(["GET"])
def api_get_settings(request):
    """Get user settings"""
    try:
        settings_obj, created = UserSettings.objects.get_or_create(user=request.user)

        return JsonResponse({
            'success': True,
            'settings': {
                'theme_mode': settings_obj.theme_mode,
                'high_contrast_enabled': settings_obj.high_contrast_enabled,
                'keyboard_navigation_hints': settings_obj.keyboard_navigation_hints,
                'screen_reader_mode': settings_obj.screen_reader_mode
            }
        })
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error getting settings: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=400)
