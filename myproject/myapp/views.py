# final_project/myapp/views.py
from rest_framework import generics
from rest_framework import viewsets,permissions
from django.http import JsonResponse
from rest_framework.views import APIView, status
from .models import Show, Movie, UserMovie, UserShow,CustomUser,Episode
from .serializers import ShowSerializer, MovieSerializer, UserMovieSerializer, UserShowSerializer,ProfileSerializer,EpisodeSerializer
from django.contrib.auth.models import User
from rest_framework.decorators import api_view,permission_classes
from django.shortcuts import render
from .serializers import UserSerializer
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
class ShowList(generics.ListCreateAPIView):
    queryset = Show.objects.all()
    serializer_class = ShowSerializer

class MovieList(generics.ListCreateAPIView):
    queryset = Movie.objects.all()
    serializer_class = MovieSerializer

class UserMovieViewSet(viewsets.ModelViewSet):
    queryset = UserMovie.objects.all()
    serializer_class = UserMovieSerializer

class UserShowViewSet(viewsets.ModelViewSet):
    queryset = UserShow.objects.all()
    serializer_class = UserShowSerializer
# ویو ساده برای صفحه اصلی


def home(request):
    return render(request, 'home.html')


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class LoginView(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        response = super(LoginView, self).post(request, *args, **kwargs)
        token = Token.objects.get(key=response.data['token'])
        user = User.objects.get(id=token.user_id)
        return Response({'token': token.key, 'user_id': user.id, 'username': user.username})

class UserShowViewSet(viewsets.ModelViewSet):
    queryset = UserShow.objects.all()
    serializer_class = UserShowSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        request.data['user'] = request.user.id
        return super().create(request, *args, **kwargs)

    def get_queryset(self):
        return UserShow.objects.filter(user=self.request.user)

class UserMovieViewSet(viewsets.ModelViewSet):
    queryset = UserMovie.objects.all()
    serializer_class = UserMovieSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        request.data['user'] = request.user.id
        return super().create(request, *args, **kwargs)

    def get_queryset(self):
        return UserMovie.objects.filter(user=self.request.user)

class ShowDetail(generics.RetrieveAPIView):
    queryset = Show.objects.all()
    serializer_class = ShowSerializer

class MovieDetail(generics.RetrieveAPIView):
    queryset = Movie.objects.all()
    serializer_class = MovieSerializer  

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def post(self, request):
        user = request.user
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_profile_image(request):
    user = request.user
    if 'profile_image' in request.FILES:
        user.profile_image = request.FILES['profile_image']
        user.save()
        # بعد از ذخیره، فایل باید یک URL داشته باشد
        if user.profile_image and hasattr(user.profile_image, 'url'):
            profile_image_url = user.profile_image.url
            return JsonResponse({'profile_image': profile_image_url})
        else:
            return JsonResponse({'error': 'Failed to save profile image'}, status=500)
    return JsonResponse({'error': 'No image uploaded'}, status=400)


@api_view(['PATCH'])
def update_movie_status(request, pk):
    try:
        movie = Movie.objects.get(pk=pk)
    except Movie.DoesNotExist:
        return Response({'error': 'Movie not found'}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get('status')
    if new_status not in dict(Movie.STATUS_CHOICES):
        return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

    movie.status = new_status
    if new_status == 'watched':
        movie.last_watched = timezone.now().date()
    else:
        movie.last_watched = None
    movie.save()

    serializer = MovieSerializer(movie, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
def get_episodes(request, show_id):
    try:
        episodes = Episode.objects.filter(show_id=show_id)
    except Episode.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    serializer = EpisodeSerializer(episodes, many=True)
    return Response(serializer.data)

@api_view(['PATCH'])
def update_episode_status(request, episode_id):
    try:
        episode = Episode.objects.get(id=episode_id)
    except Episode.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    data = request.data
    new_status = data.get('status', episode.status)

    episode.status = new_status
    if new_status == 'watched':
        episode.last_watched = timezone.now().date()
    else:
        episode.last_watched = None
    episode.save()

    serializer = EpisodeSerializer(episode)
    return Response(serializer.data)

@api_view(['PATCH'])
def update_show_status(request, pk):
    try:
        show = Show.objects.get(pk=pk)
    except Show.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if 'status' in request.data:
        show.status = request.data['status']
        show.save()
        return Response(status=status.HTTP_200_OK)
    return Response(status=status.HTTP_400_BAD_REQUEST)

# نمونه‌ای از پیاده‌سازی در Django

@csrf_exempt
def profile_image_upload(request):
    if request.method == 'POST':
        profile_image = request.FILES.get('profile_image')
        if profile_image:
            # مسیر ذخیره‌سازی
            path = default_storage.save(f'profile_images/{profile_image.name}', ContentFile(profile_image.read()))
            profile_image_url = default_storage.url(path)

            # به‌روزرسانی مدل کاربر با URL جدید
            request.user.profile.profile_image = profile_image_url
            request.user.profile.save()

            return JsonResponse({'profile_image': profile_image_url}, status=201)
        else:
            return JsonResponse({'error': 'No image provided'}, status=400)
    return JsonResponse({'error': 'Invalid request method'}, status=405)
