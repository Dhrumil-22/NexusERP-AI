from rest_framework.test import APITestCase, APIClient
from forged_auth.models import User, Business
from invoicing_finance.models import Invoice
import mongoengine
import mongomock

class InvoicingFinanceTests(APITestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        try:
            mongoengine.disconnect(alias='default')
        except:
            pass
        mongoengine.connect('mongoenginetest5_invoicing', host='localhost', mongo_client_class=mongomock.MongoClient)

    @classmethod
    def tearDownClass(cls):
        mongoengine.disconnect(alias='default')
        super().tearDownClass()

    def setUp(self):
        self.business = Business.objects.create(name='Test Bus', enabled_modules=['invoicing_finance'])
        
        self.admin_user = User.objects.create_user(
            username='admin_user', password='testpassword', business=self.business, role='Admin'
        )
        self.staff_user = User.objects.create_user(
            username='staff_user', password='testpassword', business=self.business, role='Staff'
        )
        self.client = APIClient()

    def test_create_invoice_as_admin(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post('/api/invoicing_finance/', {
            'sales_order_id': 'so123',
            'subtotal': 100.0
        }, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Invoice.objects.count(), 1)
        
        invoice = Invoice.objects.first()
        self.assertEqual(invoice.subtotal, 100.0)
        self.assertEqual(invoice.gst_amount, 10.0)
        self.assertEqual(invoice.total, 110.0)

    def test_list_invoices(self):
        Invoice.objects.create(
            business_id=str(self.business.business_id),
            sales_order_id='so123',
            subtotal=50.0,
            gst_amount=5.0,
            total=55.0
        )
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get('/api/invoicing_finance/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    def test_permission_denied_for_staff(self):
        self.client.force_authenticate(user=self.staff_user)
        response = self.client.post('/api/invoicing_finance/', {
            'sales_order_id': 'so123',
            'subtotal': 100.0
        })
        self.assertEqual(response.status_code, 403)

    def test_generate_pdf(self):
        invoice = Invoice.objects.create(
            business_id=str(self.business.business_id),
            sales_order_id='so123',
            subtotal=50.0,
            gst_amount=5.0,
            total=55.0
        )
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(f'/api/invoicing_finance/{invoice.id}/generate_pdf/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], 'application/pdf')
