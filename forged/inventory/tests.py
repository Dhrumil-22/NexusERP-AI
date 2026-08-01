from rest_framework.test import APITestCase, APIClient
from forged_auth.models import User, Business
from inventory.models import InventoryItem
import mongoengine
import mongomock

class InventoryTests(APITestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        try:
            mongoengine.disconnect(alias='default')
        except:
            pass
        mongoengine.connect('mongoenginetest5', host='localhost', mongo_client_class=mongomock.MongoClient)

    @classmethod
    def tearDownClass(cls):
        mongoengine.disconnect(alias='default')
        super().tearDownClass()

    def setUp(self):
        self.business = Business.objects.create(name='Test Bus', enabled_modules=['inventory'])
        
        self.admin_user = User.objects.create_user(
            username='admin_user', password='testpassword', business=self.business, role='Admin'
        )
        self.staff_user = User.objects.create_user(
            username='staff_user', password='testpassword', business=self.business, role='Staff'
        )
        self.client = APIClient()

    def test_create_item_as_admin(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post('/api/inventory/', {
            'item_name': 'Coffee Beans',
            'unit': 'kg',
            'quantity': 10,
            'low_stock_threshold': 2
        })
        self.assertEqual(response.status_code, 201)
        self.assertEqual(InventoryItem.objects.count(), 1)

    def test_list_items(self):
        InventoryItem.objects.create(
            business_id=str(self.business.business_id),
            item_name='Milk', unit='l', quantity=5, low_stock_threshold=1
        )
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get('/api/inventory/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    def test_permission_denied_for_staff(self):
        # Staff role only has 'view_inventory' in our static map, so edit should fail
        self.client.force_authenticate(user=self.staff_user)
        response = self.client.post('/api/inventory/', {
            'item_name': 'Tea',
            'unit': 'kg',
            'quantity': 5,
            'low_stock_threshold': 1
        })
        self.assertEqual(response.status_code, 403)
