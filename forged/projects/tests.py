from rest_framework.test import APITestCase
from rest_framework import status
from .models import Project
from forged_auth.models import User, Business
import mongoengine
import mongomock
import uuid

class ProjectsTestCase(APITestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        try:
            mongoengine.disconnect(alias='default')
        except:
            pass
        mongoengine.connect('mongoenginetest_projects', host='localhost', mongo_client_class=mongomock.MongoClient)

    @classmethod
    def tearDownClass(cls):
        mongoengine.disconnect(alias='default')
        super().tearDownClass()

    def setUp(self):
        self.business = Business.objects.create(name='Test Biz', enabled_modules=['projects'])
        self.user = User.objects.create_user(
            username='test_user',
            password='test_password',
            business=self.business,
            role='Admin'
        )
        self.client.force_authenticate(user=self.user)

    def tearDown(self):
        Project.drop_collection()
        User.objects.all().delete()
        Business.objects.all().delete()

    def test_create_project(self):
        url = '/api/projects/'
        data = {
            'name': 'Website Redesign',
            'customer_id': 'cust_123',
            'status': 'in_progress',
            'budget': 5000.00
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Project.objects.count(), 1)
        self.assertEqual(Project.objects.first().business_id, str(self.business.business_id))

    def test_list_projects(self):
        Project.objects.create(business_id=str(self.business.business_id), name='App Dev', customer_id='cust_123')
        Project.objects.create(business_id=str(uuid.uuid4()), name='Secret', customer_id='cust_999')
        
        url = '/api/projects/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'App Dev')

    def test_permission_denied(self):
        self.user.role = 'Staff'
        self.user.save()
        
        url = '/api/projects/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
