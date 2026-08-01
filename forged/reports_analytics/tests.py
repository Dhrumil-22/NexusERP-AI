from rest_framework.test import APITestCase, APIClient
from forged_auth.models import User, Business
from invoicing_finance.models import Invoice
from inventory.models import InventoryItem
import mongoengine
import mongomock

class ReportsAnalyticsTests(APITestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        try:
            mongoengine.disconnect(alias='default')
        except:
            pass
        mongoengine.connect('mongoenginetest5_reports', host='localhost', mongo_client_class=mongomock.MongoClient)

    @classmethod
    def tearDownClass(cls):
        mongoengine.disconnect(alias='default')
        super().tearDownClass()

    def setUp(self):
        self.business = Business.objects.create(name='Test Bus', enabled_modules=['reports_analytics'])
        
        self.admin_user = User.objects.create_user(
            username='admin_user', password='testpassword', business=self.business, role='Admin'
        )
        self.staff_user = User.objects.create_user(
            username='staff_user', password='testpassword', business=self.business, role='Staff'
        )
        self.client = APIClient()

    def test_revenue_report(self):
        # Create some dummy data
        Invoice.objects.create(
            business_id=str(self.business.business_id),
            sales_order_id='so1',
            total=100.0
        )
        Invoice.objects.create(
            business_id=str(self.business.business_id),
            sales_order_id='so2',
            total=50.0
        )

        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get('/api/reports_analytics/revenue/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['total_revenue'], 150.0)

    def test_low_stock_report(self):
        InventoryItem.objects.create(
            business_id=str(self.business.business_id),
            item_name='Coffee Beans',
            unit='kg',
            quantity=5.0,
            low_stock_threshold=10.0
        )
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get('/api/reports_analytics/low_stock/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['item_name'], 'Coffee Beans')

    def test_permission_denied_for_staff(self):
        self.client.force_authenticate(user=self.staff_user)
        response = self.client.get('/api/reports_analytics/revenue/')
        self.assertEqual(response.status_code, 403)
