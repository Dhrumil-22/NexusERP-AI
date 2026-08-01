from rest_framework.test import APITestCase, APIRequestFactory, force_authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from forged_auth.models import User, Business
from .permissions import HasModulePermission
import mongoengine
import mongomock

class FakeGatedView(APIView):
    permission_classes = [HasModulePermission]
    required_module = "fake_module"
    required_permission = "do_fake_action"

    def get(self, request):
        return Response({"message": "Success"})

class PermissionsTests(APITestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        try:
            mongoengine.disconnect(alias='default')
        except:
            pass
        mongoengine.connect('mongoenginetest4', host='localhost', mongo_client_class=mongomock.MongoClient)

    @classmethod
    def tearDownClass(cls):
        mongoengine.disconnect(alias='default')
        super().tearDownClass()

    def setUp(self):
        self.business = Business.objects.create(name='Test Bus', enabled_modules=['fake_module'])
        self.admin_user = User.objects.create_user(
            username='admin_user', password='testpassword', business=self.business, role='Admin'
        )
        self.staff_user = User.objects.create_user(
            username='staff_user', password='testpassword', business=self.business, role='Staff'
        )

    def test_permission_class(self):
        view = FakeGatedView.as_view()
        factory = APIRequestFactory()
        
        # Test Admin
        request_admin = factory.get('/')
        force_authenticate(request_admin, user=self.admin_user)
        response_admin = view(request_admin)
        self.assertEqual(response_admin.status_code, 200)

        # Test Staff
        request_staff = factory.get('/')
        force_authenticate(request_staff, user=self.staff_user)
        response_staff = view(request_staff)
        self.assertEqual(response_staff.status_code, 403)
