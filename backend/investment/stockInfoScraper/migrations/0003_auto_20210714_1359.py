# Generated by Django 3.0.3 on 2021-07-14 05:59

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('stockInfoScraper', '0002_auto_20210714_0228'),
    ]

    operations = [
        migrations.RenameField(
            model_name='stockinfo',
            old_name='qyantity',
            new_name='quantity',
        ),
    ]
