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
    stats = get_user_stats(request.user)

    # Calculate daily streak
    streak = 0
    today = datetime.now().date()
    current_date = today
    while GameScore.objects.filter(user=request.user, created_at__date=current_date).exists():
        streak += 1
        current_date -= timedelta(days=1)

    context = {
        'games_played_count': stats['games_played_count'],
        'ranked_games_count': stats['ranked_games_count'],
        'daily_streak': streak,
        'game_rankings': stats['game_rankings'],
        'recent_games': stats['recent_games']
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
