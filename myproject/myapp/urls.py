
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserEpisodeViewSet,update_user_show_status,update_user_episode_status,add_show_with_episodes
from .views import ShowList, MovieList, RegisterView, LoginView, UserMovieViewSet, UserShowViewSet,ShowDetail, MovieDetail,UserProfileView,update_movie_status,upload_profile_image,get_episodes,update_episode_status,update_show_status,update_user_movie_status
from rest_framework.authtoken import views

router = DefaultRouter()
router.register(r'user_shows', UserShowViewSet, basename='user-show')
router.register(r'user_movies', UserMovieViewSet, basename='user-movie')
router.register(r'user_episodes', UserEpisodeViewSet, basename='user-episode')

urlpatterns = [
    path('shows/', ShowList.as_view(), name='show-list'),
    path('movies/', MovieList.as_view(), name='movie-list'),
    path('shows/<int:pk>/', ShowDetail.as_view(), name='show-detail'),
    path('movies/<int:pk>/', MovieDetail.as_view(), name='movie-detail'), 
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('api-token-auth/', views.obtain_auth_token, name='api-token-auth'),
    path('user/profile/', UserProfileView.as_view(), name='user-profile'),
    path('user/profile/upload/', upload_profile_image, name='upload-profile-image'),
    path('movies/<int:pk>/status/', update_movie_status, name='update-movie-status'),
    path('shows/<int:show_id>/episodes/', get_episodes, name='get-episodes'),
    path('episodes/<int:episode_id>/status/', update_episode_status, name='update-episode-status'),
    path('shows/<int:pk>/status/', update_show_status, name='update-show-status'),
    path('user_movies/<int:pk>/status/', update_user_movie_status, name='update_user_movie_status'),
    path('user_shows/<int:pk>/status/', update_user_show_status, name='update_user_show_status'), 
    path('user_episodes/<int:episode_id>/status/', update_user_episode_status, name='update_user_episode_status'),
    path('user_shows/add/', add_show_with_episodes, name='add_show_with_episodes'),
    path('', include(router.urls)), 
]
