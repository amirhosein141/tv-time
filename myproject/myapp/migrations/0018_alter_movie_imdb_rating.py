# Generated by Django 4.2.2 on 2024-07-20 15:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0017_movie_imdb_rating'),
    ]

    operations = [
        migrations.AlterField(
            model_name='movie',
            name='imdb_rating',
            field=models.FloatField(default=0.0),
        ),
    ]
