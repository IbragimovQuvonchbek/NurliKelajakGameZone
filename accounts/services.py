from django.db.models import Sum, Max, Count
from games.models import GameScore
from .models import Achievement, UserAchievement
from datetime import timedelta


def get_user_stats(user):
    # Basic counts
    games_played_count = GameScore.objects.filter(user=user).count()
    ranked_games_count = GameScore.objects.filter(user=user).values('game').distinct().count()

    # Get user's best scores per game with their global ranking
    game_rankings = []
    user_scores = GameScore.objects.filter(user=user).values('game').annotate(
        high_score=Max('score')
    )

    for game_score in user_scores:
        game_id = game_score['game']
        high_score = game_score['high_score']

        # Get all scores for this game to calculate position
        all_scores = GameScore.objects.filter(game_id=game_id).values('user').annotate(
            max_score=Max('score')
        ).order_by('-max_score')

        # Find user's position
        position = 1
        for score in all_scores:
            if score['max_score'] == high_score and score['user'] == user.id:
                break
            if score['max_score'] != high_score:
                position += 1

        game = GameScore.objects.filter(game_id=game_id).first().game
        game_rankings.append({
            'position': position,
            'high_score': high_score,
            'game__name': game.name,
            'game__slug': game.slug
        })

    # Sort by position (best first)
    game_rankings.sort(key=lambda x: x['position'])

    # Get recent games
    recent_games = GameScore.objects.filter(user=user).select_related('game').order_by('-created_at')[:5]

    return {
        'games_played_count': games_played_count,
        'ranked_games_count': ranked_games_count,
        'game_rankings': game_rankings[:5],
        'recent_games': recent_games
    }


def check_and_unlock_achievements(user, score=None):
    """Check if user should unlock any achievements and unlock them"""
    from datetime import datetime
    
    unlocked_achievements = []
    
    # Get all achievements
    achievements = Achievement.objects.all()
    
    for achievement in achievements:
        # Check if user already has this achievement
        if UserAchievement.objects.filter(user=user, achievement=achievement).exists():
            continue
        
        should_unlock = False
        
        if achievement.achievement_type == 'FIRST_PLAY':
            # Check if user has played at least one game
            should_unlock = GameScore.objects.filter(user=user).exists()
            
        elif achievement.achievement_type == 'SCORE_1000':
            # Check if user has scored at least the requirement
            total_score = GameScore.objects.filter(user=user).aggregate(total=Sum('score'))['total'] or 0
            should_unlock = total_score >= achievement.requirement
            
        elif achievement.achievement_type == 'TOP_10':
            # Check if user is in top 10 of total leaderboard
            from leaderboard.views import get_leaderboard_rank
            rank = get_leaderboard_rank(user)
            should_unlock = rank <= 10 and rank > 0
            
        elif achievement.achievement_type == 'STREAK_MASTER':
            # Check if user has the required streak
            streak = calculate_daily_streak(user)
            should_unlock = streak >= achievement.requirement
            
        elif achievement.achievement_type == 'ALL_GAMES':
            # Check if user has played all games
            from games.models import Game
            total_games = Game.objects.filter(is_active=True).count()
            user_played_games = GameScore.objects.filter(user=user).values('game').distinct().count()
            should_unlock = user_played_games >= total_games
            
        elif achievement.achievement_type == 'GAME_WINNER':
            # Check if user has won at least one game (score >= requirement in a single game)
            should_unlock = GameScore.objects.filter(user=user, score__gte=achievement.requirement).exists()
        
        if should_unlock:
            UserAchievement.objects.create(user=user, achievement=achievement)
            unlocked_achievements.append(achievement)
    
    return unlocked_achievements


def calculate_daily_streak(user):
    """Calculate user's daily playing streak"""
    from datetime import datetime, timedelta
    
    today = datetime.now().date()
    current_date = today
    streak = 0
    
    # Check consecutive days starting from today
    while GameScore.objects.filter(user=user, created_at__date=current_date).exists():
        streak += 1
        current_date -= timedelta(days=1)
    
    return streak


def get_leaderboard_rank(user):
    """Get user's rank in total leaderboard"""
    from django.db.models import Sum
    
    # Get all users with their total scores
    users_total_scores = GameScore.objects.values('user').annotate(
        total_score=Sum('score')
    ).order_by('-total_score')
    
    rank = 0
    for idx, user_score in enumerate(users_total_scores, start=1):
        if user_score['user'] == user.id:
            rank = idx
            break
    
    return rank
