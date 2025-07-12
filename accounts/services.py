from django.db.models import Max, Count
from games.models import GameScore


# accounts/services.py
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
        'game_rankings': game_rankings[:5],  # Top 5 rankings
        'recent_games': recent_games
    }
