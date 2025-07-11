from django.urls import path
from . import views

app_name = 'games'

urlpatterns = [
    path('', views.home, name='home'),
    path('<slug:game_slug>/', views.game_detail, name='game_detail'),
    path('<slug:game_slug>/save-score/', views.save_score, name='save_score'),
]