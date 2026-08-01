from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ModuleDefinitionViewSet, TenantModuleViewSet

router = DefaultRouter()
router.register(r'definitions', ModuleDefinitionViewSet, basename='module-definition')
router.register(r'tenant-modules', TenantModuleViewSet, basename='tenant-module')

urlpatterns = [
    # Legacy endpoint compatibility for the frontend hooks/useModuleManifests.ts
    path('manifests/', TenantModuleViewSet.as_view({'get': 'manifests'}), name='manifests'),
    path('', include(router.urls)),
]
