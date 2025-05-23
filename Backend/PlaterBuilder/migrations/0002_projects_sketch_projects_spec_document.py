# Generated by Django 5.2 on 2025-05-09 15:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('PlaterBuilder', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='projects',
            name='sketch',
            field=models.FileField(blank=True, null=True, upload_to='documents/sketches/'),
        ),
        migrations.AddField(
            model_name='projects',
            name='spec_document',
            field=models.FileField(blank=True, null=True, upload_to='documents/specs/'),
        ),
    ]
