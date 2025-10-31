from django.urls import path
from . import views
from django.contrib.auth.views import LoginView

app_name = 'accounts'

urlpatterns = [
    path('signup/', views.signup, name='signup'),
    path('login/', LoginView.as_view(template_name='registration/login.html'), name='login'),
    path('logout/', views.custom_logout, name='logout'),
    path('profile/', views.profile, name='profile'),
    path('upload-avatar/', views.upload_avatar, name='upload_avatar'),
    path('change-password/', views.change_password, name='change_password'),
    path('profile/<str:username>/', views.user_profile, name='user_profile'),

    # API Endpoints for Social Features
    path('api/users/<int:user_id>/follow/', views.api_follow_user, name='api_follow_user'),
    path('api/users/<int:user_id>/unfollow/', views.api_unfollow_user, name='api_unfollow_user'),
    path('api/users/following/', views.api_get_following_list, name='api_get_following_list'),
    path('api/users/<int:user_id>/followers/', views.api_get_followers_list, name='api_get_followers_list'),
    path('api/activity-feed/', views.api_get_activity_feed, name='api_get_activity_feed'),
    path('api/users/settings/', views.api_update_settings, name='api_update_settings'),
    path('api/users/settings-get/', views.api_get_settings, name='api_get_settings'),
]
