# Generated by Django 4.2.2 on 2024-07-17 08:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0004_movie_status_show_status'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='episode',
            name='duration',
        ),
        migrations.AddField(
            model_name='episode',
            name='air_date',
            field=models.DateField(blank=True, null=True),
        ),
    ]
