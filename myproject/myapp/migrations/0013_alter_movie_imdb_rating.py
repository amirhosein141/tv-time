# Generated by Django 4.2.2 on 2024-07-20 15:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0012_alter_movie_imdb_rating_alter_movie_runtime'),
    ]

    operations = [
        migrations.AlterField(
            model_name='movie',
            name='imdb_rating',
            field=models.FloatField(default=1),
        ),
    ]
