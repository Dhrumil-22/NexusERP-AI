from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from forged_auth.models import User, Business
import mongoengine
import mongomock

class BusinessSetupTests(APITestCase):
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

    def setUp(self):
        self.business = Business.objects.create(name='Old Name', industry_tag='Retail')
        self.user = User.objects.create_user(
            username='testadmin',
            password='testpassword',
            business=self.business,
            role='Admin'
        )
        self.client.force_authenticate(user=self.user)

    def test_onboarding_flow(self):
        url = reverse('business_onboarding')
        data = {
            'business_name': 'New Name Cafe',
            'industry': 'Cafe',
            'address': '123 Test St',
            'gst_number': 'GST12345'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.business.refresh_from_db()
        self.assertEqual(self.business.name, 'New Name Cafe')
        self.assertEqual(self.business.industry_tag, 'Cafe')
        self.assertEqual(self.business.address, '123 Test St')
        self.assertEqual(self.business.gst_number, 'GST12345')
