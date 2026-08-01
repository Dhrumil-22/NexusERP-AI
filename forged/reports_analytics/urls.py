from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReportsAnalyticsViewSet

router = DefaultRouter()
router.register(r'', ReportsAnalyticsViewSet, basename='reports_analytics')

urlpatterns = [
    path('', include(router.urls)),
]
