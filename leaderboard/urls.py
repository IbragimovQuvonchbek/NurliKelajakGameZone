from django.urls import path
from . import views

app_name = 'leaderboard'

urlpatterns = [
    path('', views.leaderboards_home, name='leaderboards_home'),
    path('total/', views.total_leaderboard, name='total_leaderboard'),
    path('games/<slug:game_slug>/', views.game_leaderboard, name='game_leaderboard'),
]
