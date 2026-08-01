from rest_framework.test import APITestCase, APIClient
from forged_auth.models import User, Business
from sales_orders.models import SalesOrder
import mongoengine
import mongomock

class SalesOrdersTests(APITestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        try:
            mongoengine.disconnect(alias='default')
        except:
            pass
        mongoengine.connect('mongoenginetest5_sales_orders', host='localhost', mongo_client_class=mongomock.MongoClient)

    @classmethod
    def tearDownClass(cls):
        mongoengine.disconnect(alias='default')
        super().tearDownClass()

    def setUp(self):
        self.business = Business.objects.create(name='Test Bus', enabled_modules=['sales_orders'])
        
        self.admin_user = User.objects.create_user(
            username='admin_user', password='testpassword', business=self.business, role='Admin'
        )
        self.staff_user = User.objects.create_user(
            username='staff_user', password='testpassword', business=self.business, role='Staff'
        )
        self.client = APIClient()

    def test_create_sales_order_as_admin(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post('/api/sales_orders/', {
            'customer_id': 'cust123',
            'status': 'placed',
            'total': 15.50,
            'line_items': [
                {'item_id': 'item1', 'quantity': 2.0}
            ]
        }, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(SalesOrder.objects.count(), 1)
        self.assertEqual(len(SalesOrder.objects.first().line_items), 1)

    def test_list_sales_orders(self):
        SalesOrder.objects.create(
            business_id=str(self.business.business_id),
            customer_id='cust123',
            status='preparing',
            total=20.0
        )
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get('/api/sales_orders/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    def test_permission_denied_for_staff(self):
        self.client.force_authenticate(user=self.staff_user)
        response = self.client.post('/api/sales_orders/', {
            'total': 100.0
        })
        self.assertEqual(response.status_code, 403)
