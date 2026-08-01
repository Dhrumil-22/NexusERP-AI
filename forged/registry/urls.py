from django.urls import path
from .views import ManifestListView, EnabledModulesView

urlpatterns = [
    path('manifests/', ManifestListView.as_view(), name='manifest_list'),
    path('business/<str:business_id>/enabled-modules/', EnabledModulesView.as_view(), name='enabled_modules_get'),
    path('business/<str:business_id>/enable-module/', EnabledModulesView.as_view(), name='enabled_modules_post'),
]
