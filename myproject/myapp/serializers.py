from rest_framework import serializers
from .models import Show, Movie, Actor, Episode, UserMovie, UserShow,UserEpisode
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from .models import CustomUser

class ActorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Actor
        fields = ['id', 'name', 'birth_date']

class EpisodeSerializer(serializers.ModelSerializer):
    
        class Meta:
             model = Episode
             fields = '__all__'

class ShowSerializer(serializers.ModelSerializer):
    actors = ActorSerializer(many=True)
    episodes = EpisodeSerializer(many=True, read_only=True)
    image = serializers.SerializerMethodField()

    class Meta:
        model = Show
        fields = ['id', 'title', 'start_year', 'genres', 'seasons', 'platform', 'description', 'average_episode_duration', 'actors', 'episodes', 'image','status','imdb_rating']
    def get_image(self, obj):
        
        if obj.image:
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(obj.image.url)
        return None    

class MovieSerializer(serializers.ModelSerializer):
    actors = ActorSerializer(many=True)
    image = serializers.SerializerMethodField()

    class Meta:
        model = Movie
        fields = ['id', 'title', 'release_year', 'genres', 'description', 'actors', 'image', 'director_name', 'runtime', 'imdb_rating', 'air_date']

    def get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(obj.image.url)
        return None
   


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'password', 'email')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        user.is_staff = True  # کاربر از نوع staff
        user.save()
        Token.objects.create(user=user)
        return user
class UserShowSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserShow
        fields = ['id', 'user', 'show', 'status']

class UserMovieSerializer(serializers.ModelSerializer):
    movie_runtime = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = UserMovie
        fields = ['id', 'user', 'movie', 'status', 'last_watched', 'movie_runtime']

    def get_movie_runtime(self, obj):
        return obj.movie.runtime

    def get_status(self, obj):
        return obj.status 

from .models import CustomUser

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id','username', 'profile_image']        
        
class UserEpisodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserEpisode
        fields = '__all__'        