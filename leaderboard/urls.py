from django.urls import path
from . import views

app_name = 'leaderboard'

urlpatterns = [
    path('<slug:game_slug>/', views.game_leaderboard, name='game_leaderboard'),
]