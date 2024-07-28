# Generated by Django 4.2.2 on 2024-07-16 06:57

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0002_actor_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='show',
            name='episodes',
        ),
        migrations.AddField(
            model_name='movie',
            name='image',
            field=models.ImageField(blank=True, null=True, upload_to='movies/'),
        ),
        migrations.AddField(
            model_name='show',
            name='image',
            field=models.ImageField(blank=True, null=True, upload_to='shows/'),
        ),
        migrations.CreateModel(
            name='Episode',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('season_number', models.IntegerField()),
                ('episode_number', models.IntegerField()),
                ('title', models.CharField(max_length=200)),
                ('duration', models.IntegerField()),
                ('show', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='episodes', to='myapp.show')),
            ],
        ),
    ]