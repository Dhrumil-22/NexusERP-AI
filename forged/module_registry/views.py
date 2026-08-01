from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import ModuleDefinition, TenantModule
from .serializers import ModuleDefinitionSerializer, TenantModuleSerializer
import django.dispatch

module_enabled = django.dispatch.Signal()
module_disabled = django.dispatch.Signal()

class ModuleDefinitionViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    queryset = ModuleDefinition.objects.all()
    serializer_class = ModuleDefinitionSerializer

class TenantModuleViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = TenantModuleSerializer

    def get_queryset(self):
        return TenantModule.objects.for_tenant(self.request.user.tenant_id)

    @action(detail=False, methods=['get'])
    def manifests(self, request):
        if getattr(request.user, 'is_superuser', False):
            enabled_ids = [d.module_id for d in ModuleDefinition.objects.all()]
        elif getattr(request.user, 'role', '') == 'Staff':
            enabled_ids = getattr(request.user, 'assigned_modules', [])
        elif getattr(request.user, 'business', None):
            enabled_ids = request.user.business.enabled_modules or []
            if isinstance(enabled_ids, str):
                import json
                try:
                    enabled_ids = json.loads(enabled_ids)
                except json.JSONDecodeError:
                    enabled_ids = []
        else:
            enabled_ids = []
            
        defs = ModuleDefinition.objects.filter(module_id__in=enabled_ids)
        manifests = [d.manifest_json for d in defs]
        return Response(manifests)
