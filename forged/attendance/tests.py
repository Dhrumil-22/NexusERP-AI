from typing import Any
from rest_framework.test import APITestCase, APIClient
from forged_auth.models import User, Business
from attendance.models import AttendanceRecord
from datetime import datetime, timezone

class AttendanceTests(APITestCase):

    def setUp(self):
        self.business = Business.objects.create(name='Test Bus', enabled_modules=['attendance'])
        from module_registry.models import TenantModule
        TenantModule.objects.create(tenant_id=self.business.business_id, module_id='attendance', is_enabled=True)
        
        self.admin_user = User.objects.create_user(
            username='admin_user', password='testpassword', business=self.business, role='Admin'
        )
        self.staff_user = User.objects.create_user(
            username='staff_user', password='testpassword', business=self.business, role='Staff'
        )
        self.api_client = APIClient()

    def test_create_attendance_as_admin(self):
        self.api_client.force_authenticate(user=self.admin_user)
        response: Any = self.api_client.post('/api/attendance/records/', {
            'employee_id': 'emp123',
            'date': '2023-10-25',
            'clock_in': '2023-10-25T09:00:00Z'
        }, format='json')
        assert hasattr(response, 'status_code')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(AttendanceRecord.objects.count(), 1)
        self.assertEqual(AttendanceRecord.objects.first().employee_id, 'emp123')

    def test_list_attendance(self):
        AttendanceRecord.objects.create(
            tenant=self.business,
            employee_id='emp123',
            date='2023-10-25',
            clock_in=datetime(2023, 10, 25, 9, 0, tzinfo=timezone.utc)
        )
        self.api_client.force_authenticate(user=self.admin_user)
        response: Any = self.api_client.get('/api/attendance/records/')
        assert hasattr(response, 'status_code')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    def test_permission_denied_for_staff(self):
        self.api_client.force_authenticate(user=self.staff_user)
        response: Any = self.api_client.get('/api/attendance/records/')
        assert hasattr(response, 'status_code')
        self.assertEqual(response.status_code, 403)
