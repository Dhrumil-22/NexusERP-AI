from rest_framework.test import APITestCase, APIClient
from forged_auth.models import User, Business
from purchase_orders.models import PurchaseOrder
import mongoengine
import mongomock

class PurchaseOrdersTests(APITestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        try:
            mongoengine.disconnect(alias='default')
        except:
            pass
        mongoengine.connect('mongoenginetest5_purchase_orders', host='localhost', mongo_client_class=mongomock.MongoClient)

    @classmethod
    def tearDownClass(cls):
        mongoengine.disconnect(alias='default')
        super().tearDownClass()

    def setUp(self):
        self.business = Business.objects.create(name='Test Bus', enabled_modules=['purchase_orders'])
        
        self.admin_user = User.objects.create_user(
            username='admin_user', password='testpassword', business=self.business, role='Admin'
        )
        self.staff_user = User.objects.create_user(
            username='staff_user', password='testpassword', business=self.business, role='Staff'
        )
        self.client = APIClient()

    def test_create_purchase_order_as_admin(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post('/api/purchase_orders/', {
            'supplier_id': 'supp123',
            'status': 'draft',
            'line_items': [
                {'item_id': 'item1', 'quantity': 10.0}
            ]
        }, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(PurchaseOrder.objects.count(), 1)
        self.assertEqual(len(PurchaseOrder.objects.first().line_items), 1)

    def test_list_purchase_orders(self):
        PurchaseOrder.objects.create(
            business_id=str(self.business.business_id),
            supplier_id='supp123',
            status='sent'
        )
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get('/api/purchase_orders/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    def test_permission_denied_for_staff(self):
        self.client.force_authenticate(user=self.staff_user)
        response = self.client.post('/api/purchase_orders/', {
            'supplier_id': 'supp123',
            'status': 'draft'
        })
        self.assertEqual(response.status_code, 403)
