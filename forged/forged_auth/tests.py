from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import User, Business
import mongoengine
import mongomock

class AuthTests(APITestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        mongoengine.disconnect(alias='default')
        try:
            mongoengine.disconnect(alias='default')
        except:
            pass
        mongoengine.connect('mongoenginetest', host='localhost', mongo_client_class=mongomock.MongoClient)

    @classmethod
    def tearDownClass(cls):
        mongoengine.disconnect('mongoenginetest')
        super().tearDownClass()

    def test_register_login_refresh_flow(self):
        # 1. Register
        register_url = reverse('register_business')
        register_data = {
            'business_name': 'Test Cafe',
            'industry_tag': 'Cafe',
            'username': 'admin_user',
            'password': 'testpassword123',
            'email': 'admin@test.com'
        }
        response = self.client.post(register_url, register_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        business = Business.objects.first()
        self.assertIsNotNone(business)
        self.assertEqual(business.name, 'Test Cafe')

        user = User.objects.first()
        self.assertIsNotNone(user)
        self.assertEqual(user.username, 'admin_user')
        self.assertEqual(user.role, 'Admin')
        self.assertEqual(user.business, business)

        # 2. Login
        login_url = reverse('token_obtain_pair')
        login_data = {
            'username': 'admin_user',
            'password': 'testpassword123'
        }
        response = self.client.post(login_url, login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        
        access_token = response.data['access']
        refresh_token = response.data['refresh']

        # 3. Protected endpoint without token -> 401
        me_url = reverse('me')
        response = self.client.get(me_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # 4. Protected endpoint with token -> 200
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + access_token)
        response = self.client.get(me_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'admin_user')
        
        # 5. Refresh token
        refresh_url = reverse('token_refresh')
        refresh_data = {
            'refresh': refresh_token
        }
        self.client.credentials()
        response = self.client.post(refresh_url, refresh_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
