import mongoengine
from django.test import TestCase
from .models import ModuleManifest

class ManifestTests(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        # Connect to a mock mongo database for testing
        import mongomock
        try:
            mongoengine.disconnect(alias='default')
        except:
            pass
        mongoengine.connect('mongoenginetest', host='localhost', mongo_client_class=mongomock.MongoClient)

    @classmethod
    def tearDownClass(cls):
        # Disconnect and clean up
        mongoengine.disconnect(alias='default')
        super().tearDownClass()

    def test_register_manifest(self):
        fake_manifest = {
            "module_id": "inventory",
            "version": "1.0",
            "depends_on": ["auth"],
            "permissions": ["view_inventory", "edit_inventory"],
            "forms": [{
                "form_id": "add_item",
                "fields": [
                    {"name": "item_name", "label": "Item name", "type": "text", "required": True},
                    {"name": "quantity", "label": "Quantity", "type": "number", "required": True}
                ]
            }],
            "dashboard_widgets": [
                {"widget_id": "stock_levels", "type": "bar_chart"}
            ],
            "api_routes": ["/api/inventory/"]
        }
        
        # Call the manager method
        manifest = ModuleManifest.register_manifest(fake_manifest)
        
        # Read it back
        saved_manifest = ModuleManifest.objects(module_id="inventory").first()
        self.assertIsNotNone(saved_manifest)
        self.assertEqual(saved_manifest.version, "1.0")
        self.assertEqual(len(saved_manifest.forms), 1)
        self.assertEqual(saved_manifest.forms[0].form_id, "add_item")
        self.assertEqual(len(saved_manifest.dashboard_widgets), 1)
        self.assertEqual(saved_manifest.dashboard_widgets[0].widget_id, "stock_levels")

from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from forged_auth.models import User, Business

class RegistryAPITests(APITestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        import mongomock
        try:
            mongoengine.disconnect(alias='default')
        except:
            pass
        mongoengine.connect('mongoenginetest2', host='localhost', mongo_client_class=mongomock.MongoClient)

    @classmethod
    def tearDownClass(cls):
        mongoengine.disconnect(alias='default')
        super().tearDownClass()

    def setUp(self):
        self.business = Business.objects.create(name='Test Bus', enabled_modules=[])
        self.user = User.objects.create_user(
            username='testreg',
            password='testpassword',
            business=self.business,
            role='Admin'
        )
        ModuleManifest.register_manifest({
            "module_id": "test_module",
            "version": "1.0",
            "depends_on": [],
            "permissions": [],
            "forms": [],
            "dashboard_widgets": [],
            "api_routes": []
        })

    def test_manifest_list(self):
        url = reverse('manifest_list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) > 0)
        self.assertEqual(response.data[0]['module_id'], 'test_module')

    def test_enabled_modules_flow(self):
        self.client.force_authenticate(user=self.user)
        
        url_post = reverse('enabled_modules_post', kwargs={'business_id': str(self.business.business_id)})
        response = self.client.post(url_post, {'module_id': 'test_module'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('test_module', response.data['enabled_modules'])
        
        url_get = reverse('enabled_modules_get', kwargs={'business_id': str(self.business.business_id)})
        response = self.client.get(url_get)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('test_module', response.data['enabled_modules'])
