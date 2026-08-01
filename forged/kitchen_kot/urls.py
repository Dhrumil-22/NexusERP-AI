from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import KitchenTicketViewSet

router = DefaultRouter()
router.register(r'tickets', KitchenTicketViewSet, basename='kitchenticket')

urlpatterns = [
    path('', include(router.urls)),
]
