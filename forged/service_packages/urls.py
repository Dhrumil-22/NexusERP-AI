from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServiceViewSet, ServicePackageViewSet, StaffServiceSkillViewSet

router = DefaultRouter()
router.register(r'services', ServiceViewSet, basename='service')
router.register(r'packages', ServicePackageViewSet, basename='package')
router.register(r'skills', StaffServiceSkillViewSet, basename='skill')

urlpatterns = [
    path('', include(router.urls)),
]
