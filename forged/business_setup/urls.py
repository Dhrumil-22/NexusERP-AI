from django.urls import path
from .views import BusinessSetupView

urlpatterns = [
    path('onboarding/', BusinessSetupView.as_view(), name='business_onboarding'),
    path('onboarding_form/', BusinessSetupView.as_view(), name='org_settings_form'),
    path('', BusinessSetupView.as_view(), name='org_settings_get'),
]
