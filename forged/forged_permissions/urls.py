from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PermissionViewSet, RoleViewSet, RolePermissionViewSet, EmployeeOverrideViewSet

router = DefaultRouter()
router.register(r'global', PermissionViewSet, basename='permission')
router.register(r'roles', RoleViewSet, basename='role')
router.register(r'role-mappings', RolePermissionViewSet, basename='rolepermission')
router.register(r'overrides', EmployeeOverrideViewSet, basename='employeeoverride')

urlpatterns = [
    path('', include(router.urls)),
]
