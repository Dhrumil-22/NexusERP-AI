from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterBusinessView, LoginView, MeView, PasswordResetView, SessionViewSet, EmployeeViewSet, SuperAdminBusinessListView, SuperAdminBusinessTicketsView, ForgotPasswordRequestView, ForgotPasswordVerifyView

router = DefaultRouter()
router.register(r'sessions', SessionViewSet, basename='auth-session')
router.register(r'employees', EmployeeViewSet, basename='auth-employee')

urlpatterns = [
    path('register/', RegisterBusinessView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('me/', MeView.as_view(), name='me'),
    path('password_reset/', PasswordResetView.as_view(), name='password_reset'),
    path('forgot_password_request/', ForgotPasswordRequestView.as_view(), name='forgot_password_request'),
    path('forgot_password_verify/', ForgotPasswordVerifyView.as_view(), name='forgot_password_verify'),
    path('super_admin/businesses/', SuperAdminBusinessListView.as_view(), name='super_admin_businesses'),
    path('super_admin/businesses/<uuid:business_id>/tickets/', SuperAdminBusinessTicketsView.as_view(), name='super_admin_business_tickets'),
    path('', include(router.urls)),
]
