from django.http import Http404
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
from games.models import GameScore
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.db.models import Sum


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
