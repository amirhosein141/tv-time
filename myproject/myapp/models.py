
from django.db import models
from datetime import date
from django.contrib.auth.models import User
from django.contrib.auth.models import AbstractUser, Group, Permission
class Actor(models.Model):
    name = models.CharField(max_length=100)
    birth_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return self.name

class Show(models.Model):
    title = models.CharField(max_length=200)
    start_year = models.IntegerField()
    genres = models.CharField(max_length=200)
    seasons = models.IntegerField()
    platform = models.CharField(max_length=100)
    description = models.TextField()
    average_episode_duration = models.IntegerField()
    actors = models.ManyToManyField(Actor, related_name='shows')
    image = models.ImageField(upload_to='shows/', null=True, blank=True)
    imdb_rating = models.FloatField(default=1) 
    STATUS_CHOICES = [
        ('completed','show is done'),
        ('watching','still watching'),
        ('not_watched','not started'),
    ]
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='not_watched',
    )

    def __str__(self):
        return self.title

class Episode(models.Model):
    show = models.ForeignKey(Show, related_name='episodes', on_delete=models.CASCADE)
    season_number = models.IntegerField()
    episode_number = models.IntegerField()
    title = models.CharField(max_length=200)
    last_watched=models.DateField(null=True, blank=True)
    air_date = models.DateField(null=True, blank=True)
    STATUS_CHOICES = [
        ('watched', 'Watched'),
        ('not_watched', 'Not Watched'),
    ]
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='not_watched',
    )

    def __str__(self):
        return f"{self.title} (S{self.season_number}E{self.episode_number})"

def clean_imdb_rating(value):
    try:
        return float(value)
    except (ValueError, TypeError):
        return 0.0 
class Movie(models.Model):
    title = models.CharField(max_length=200)
    release_year = models.IntegerField()
    genres = models.CharField(max_length=200)
    description = models.TextField()
    actors = models.ManyToManyField('Actor', related_name='movies')
    image = models.ImageField(upload_to='movies/', null=True, blank=True)
    director_name = models.CharField(max_length=200, default='Unknown')
    runtime = models.IntegerField(default=0)
    imdb_rating = models.FloatField(default=1)
    air_date = models.DateField(default=date.today)

    def __str__(self):
        return self.title
class UserMovie(models.Model):
    STATUS_CHOICES = [
        ('watched', 'Watched'),
        ('not_watched', 'Not Watched'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='not_watched',
    )
    last_watched = models.DateField(null=True, blank=True)

class UserEpisode(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    episode = models.ForeignKey(Episode, on_delete=models.CASCADE)
    last_watched = models.DateField(null=True, blank=True)
    STATUS_CHOICES = [
        ('watched', 'Watched'),
        ('not_watched', 'Not Watched'),
    ]
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='not_watched',
    )

    class Meta:
        unique_together = ('user', 'episode')

    def __str__(self):
        return f"{self.user.username} - {self.episode.title} ({self.status})"
    
class UserShow(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    show = models.ForeignKey(Show, on_delete=models.CASCADE)
    STATUS_CHOICES = [
        ('completed', 'Show is done'),
        ('watching', 'Still watching'),
        ('not_watched', 'Not started'),
    ]
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='not_watched',
    )

    class Meta:
        unique_together = ('user', 'show')

    def __str__(self):
        return f"{self.user.username} - {self.show.title} ({self.status})"


class CustomUser(AbstractUser):
    profile_image = models.ImageField(upload_to='profile_images/', null=True, blank=True)
    groups = models.ManyToManyField(
        Group,
        related_name='customuser_set', 
        blank=True,
        help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name='customuser_set',  
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )
