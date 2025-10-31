from django.urls import path
from . import views

app_name = 'games'

urlpatterns = [
    path('', views.home, name='home'),
    # Make this more specific than just <slug:game_slug>
    path('games/<slug:game_slug>/', views.game_detail, name='game_detail'),
    path('games/<slug:game_slug>/save-score/', views.save_score, name='save_score'),

    # API Endpoints
    path('api/challenges/', views.api_send_challenge, name='api_send_challenge'),
    path('api/challenges/<int:challenge_id>/respond/', views.api_respond_challenge, name='api_respond_challenge'),
    path('api/challenges/pending/', views.api_get_pending_challenges, name='api_get_pending_challenges'),
    path('api/scores/<int:score_id>/share/', views.api_share_score, name='api_share_score'),
    path('api/shares/<str:share_token>/', views.api_view_shared_score, name='api_view_shared_score'),
    path('api/games/recommended/', views.api_get_recommended_games, name='api_get_recommended_games'),
    path('api/games/<int:game_id>/tutorial-complete/', views.api_mark_tutorial_complete, name='api_mark_tutorial_complete'),
]
