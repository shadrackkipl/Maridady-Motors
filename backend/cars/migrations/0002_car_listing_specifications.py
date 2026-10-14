from django.db import migrations, models


def populate_listing_fields(apps, schema_editor):
    Car = apps.get_model('cars', 'Car')
    for car in Car.objects.all().iterator():
        car.stock_number = f'MM-{car.pk:06d}'
        car.save(update_fields=['stock_number'])


class Migration(migrations.Migration):

    dependencies = [
        ('cars', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='car',
            name='stock_number',
            field=models.CharField(
                blank=True,
                default='',
                max_length=30,
                verbose_name='Stock no.',
            ),
        ),
        migrations.AddField(
            model_name='car',
            name='engine_capacity',
            field=models.PositiveIntegerField(
                default=0,
                help_text='Engine capacity in cc',
            ),
        ),
        migrations.AddField(
            model_name='car',
            name='drivetrain',
            field=models.CharField(
                choices=[('2WD', '2WD'), ('4WD', '4WD'), ('AWD', 'AWD')],
                blank=True,
                default='',
                max_length=10,
            ),
        ),
        migrations.RunPython(
            populate_listing_fields,
            migrations.RunPython.noop,
        ),
        migrations.AlterField(
            model_name='car',
            name='stock_number',
            field=models.CharField(
                max_length=30,
                unique=True,
                verbose_name='Stock no.',
            ),
        ),
        migrations.AlterField(
            model_name='car',
            name='engine_capacity',
            field=models.PositiveIntegerField(
                help_text='Engine capacity in cc',
            ),
        ),
        migrations.AlterField(
            model_name='car',
            name='description',
            field=models.TextField(blank=True, default=''),
        ),
        migrations.AlterField(
            model_name='car',
            name='transmission',
            field=models.CharField(
                choices=[('Automatic', 'Automatic'), ('Manual', 'Manual')],
                default='Automatic',
                max_length=20,
            ),
        ),
        migrations.AlterField(
            model_name='car',
            name='fuel_type',
            field=models.CharField(
                choices=[
                    ('Petrol', 'Petrol'),
                    ('Diesel', 'Diesel'),
                    ('Hybrid', 'Hybrid'),
                    ('Electric', 'Electric'),
                ],
                default='Petrol',
                max_length=20,
            ),
        ),
    ]
