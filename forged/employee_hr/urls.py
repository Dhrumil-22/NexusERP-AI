from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RoleViewSet, EmployeeViewSet, ShiftViewSet, AttendanceViewSet

router = DefaultRouter()
router.register(r'roles', RoleViewSet, basename='role')
router.register(r'employees', EmployeeViewSet, basename='employee')
router.register(r'shifts', ShiftViewSet, basename='shift')
router.register(r'attendance', AttendanceViewSet, basename='attendance')

urlpatterns = [
    path('', include(router.urls)),
]
