# final_project/myapp/admin.py

from django.contrib import admin
from .models import Show, Movie, Actor, Episode,UserShow, UserMovie

class ActorAdmin(admin.ModelAdmin):
    list_display = ('name', 'birth_date')

class ShowAdmin(admin.ModelAdmin):
    list_display = ('title', 'start_year', 'platform')
    filter_horizontal = ('actors',)
    search_fields = ('title', 'start_year')
    list_filter = ('start_year', 'platform')

class EpisodeAdmin(admin.ModelAdmin):
    list_display = ('title', 'show', 'season_number', 'episode_number')
    search_fields = ('title', 'show__title')
    list_filter = ('season_number', 'show__title')

class MovieAdmin(admin.ModelAdmin):
    list_display = ('title', 'release_year')
    filter_horizontal = ('actors',)
    search_fields = ('title', 'release_year')
    list_filter = ('release_year',)
@admin.register(UserShow)
class UserShowAdmin(admin.ModelAdmin):
    list_display = ('user', 'show')

@admin.register(UserMovie)
class UserMovieAdmin(admin.ModelAdmin):
    list_display = ('user', 'movie')    

admin.site.register(Actor, ActorAdmin)
admin.site.register(Show, ShowAdmin)
admin.site.register(Episode, EpisodeAdmin)
admin.site.register(Movie, MovieAdmin)
