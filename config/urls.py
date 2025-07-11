from django.contrib import admin
from django.urls import path, include
from django.contrib.auth.views import LogoutView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('accounts.urls')),
    path('accounts/', include('django.contrib.auth.urls')),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('', include('games.urls')),
    path('leaderboard/', include('leaderboard.urls')),
]

# This properly combines both URL patterns and static files configuration
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
