from io import BytesIO
from tempfile import TemporaryDirectory

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from django.test import override_settings
from PIL import Image
from rest_framework.test import APIClient
from .models import Car


class CarApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.car_data = {
            'make': 'Toyota',
            'model_name': 'Corolla',
            'year': 2022,
            'stock_number': 'MM-0001',
            'price': '18500.00',
            'mileage': 24000,
            'engine_capacity': 1800,
            'drivetrain': '2WD',
            'description': 'Well maintained vehicle',
            'transmission': 'Automatic',
            'fuel_type': 'Petrol',
            'is_available': True,
        }

    def test_add_car_creates_inventory_record(self):
        image = BytesIO()
        Image.new('RGB', (1, 1), color='white').save(image, format='JPEG')
        image.seek(0)
        upload = SimpleUploadedFile(
            'vehicle.jpg', image.read(), content_type='image/jpeg'
        )

        with TemporaryDirectory() as media_root, override_settings(
            MEDIA_ROOT=media_root
        ):
            self.client.force_authenticate(
                user=get_user_model().objects.create_user(
                    username='inventory-admin'
                )
            )
            response = self.client.post(
                '/api/cars/add/',
                {**self.car_data, 'description': '', 'image': upload},
                format='multipart',
            )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(Car.objects.count(), 1)
        self.assertEqual(response.data['data']['model_name'], 'Corolla')
        self.assertEqual(response.data['data']['stock_number'], 'MM-0001')
        self.assertEqual(response.data['data']['engine_capacity'], 1800)
        self.assertEqual(response.data['data']['drivetrain'], '2WD')
        self.assertIn('/media/cars/vehicle', response.data['data']['image'])

    def test_car_listing_returns_available_vehicles(self):
        available_car = Car.objects.create(**self.car_data)
        hidden_car = Car.objects.create(
            **{
                **self.car_data,
                'model_name': 'Yaris',
                'stock_number': 'MM-0002',
                'is_available': False,
            }
        )

        response = self.client.get('/api/cars/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual([car['id'] for car in response.data], [available_car.id])
        self.assertNotIn(hidden_car.id, [car['id'] for car in response.data])
