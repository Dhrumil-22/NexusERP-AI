from rest_framework.test import APITestCase, APIClient
from forged_auth.models import User, Business
from employees.models import Employee
import mongoengine
import mongomock

class EmployeesTests(APITestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        try:
            mongoengine.disconnect(alias='default')
        except:
            pass
        mongoengine.connect('mongoenginetest5_employees', host='localhost', mongo_client_class=mongomock.MongoClient)

    @classmethod
    def tearDownClass(cls):
        mongoengine.disconnect(alias='default')
        super().tearDownClass()

    def setUp(self):
        self.business = Business.objects.create(name='Test Bus', enabled_modules=['employees'])
        
        self.admin_user = User.objects.create_user(
            username='admin_user', password='testpassword', business=self.business, role='Admin'
        )
        self.staff_user = User.objects.create_user(
            username='staff_user', password='testpassword', business=self.business, role='Staff'
        )
        self.client = APIClient()

    def test_create_employee_as_admin(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post('/api/employees/', {
            'name': 'Jane Smith',
            'role': 'Manager',
            'phone': '123-456-7890',
            'hire_date': '2023-01-15'
        }, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Employee.objects.count(), 1)
        self.assertEqual(Employee.objects.first().name, 'Jane Smith')

    def test_list_employees(self):
        Employee.objects.create(
            business_id=str(self.business.business_id),
            name='Bob Builder',
            role='Worker'
        )
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get('/api/employees/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    def test_permission_denied_for_staff(self):
        self.client.force_authenticate(user=self.staff_user)
        response = self.client.post('/api/employees/', {
            'name': 'Unauthorized Employee',
            'role': 'Sneak'
        })
        self.assertEqual(response.status_code, 403)
