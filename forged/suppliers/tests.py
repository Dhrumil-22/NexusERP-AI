from rest_framework.test import APITestCase, APIClient
from forged_auth.models import User, Business
from suppliers.models import Supplier
import mongoengine
import mongomock

class SuppliersTests(APITestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        try:
            mongoengine.disconnect(alias='default')
        except:
            pass
        mongoengine.connect('mongoenginetest5_suppliers', host='localhost', mongo_client_class=mongomock.MongoClient)

    @classmethod
    def tearDownClass(cls):
        mongoengine.disconnect(alias='default')
        super().tearDownClass()

    def setUp(self):
        self.business = Business.objects.create(name='Test Bus', enabled_modules=['suppliers'])
        
        self.admin_user = User.objects.create_user(
            username='admin_user', password='testpassword', business=self.business, role='Admin'
        )
        self.staff_user = User.objects.create_user(
            username='staff_user', password='testpassword', business=self.business, role='Staff'
        )
        self.client = APIClient()

    def test_create_supplier_as_admin(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post('/api/suppliers/', {
            'name': 'Global Supplies Inc.',
            'phone': '1-800-555-0199',
            'items_supplied': ['Coffee Beans', 'Tea Leaves'],
            'notes': 'Reliable'
        }, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Supplier.objects.count(), 1)
        self.assertEqual(len(Supplier.objects.first().items_supplied), 2)

    def test_list_suppliers(self):
        Supplier.objects.create(
            business_id=str(self.business.business_id),
            name='Local Farm',
            phone='555-0100'
        )
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get('/api/suppliers/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    def test_permission_denied_for_staff(self):
        self.client.force_authenticate(user=self.staff_user)
        response = self.client.post('/api/suppliers/', {
            'name': 'Unauthorized Supplier'
        })
        self.assertEqual(response.status_code, 403)
