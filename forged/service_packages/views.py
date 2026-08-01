from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Service, ServicePackage, StaffServiceSkill
from .serializers import ServiceSerializer, ServicePackageSerializer, StaffServiceSkillSerializer
from core.events import service_completed

class ServiceViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ServiceSerializer

    def get_queryset(self):
        return Service.objects.for_tenant(self.request.user.tenant_id)

    def perform_create(self, serializer):
        serializer.save(tenant_id=self.request.user.tenant_id)
        
    @action(detail=True, methods=['post'])
    def mark_completed(self, request, pk=None):
        service = self.get_object()
        
        # In a real app this would likely link to an appointment or ticket.
        service_completed.send(
            sender=self.__class__,
            tenant_id=self.request.user.tenant_id,
            service_id=str(service.id),
            price=float(service.price)
        )
        return Response({'status': 'Service marked as completed'})

class ServicePackageViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ServicePackageSerializer

    def get_queryset(self):
        return ServicePackage.objects.for_tenant(self.request.user.tenant_id)

    def perform_create(self, serializer):
        serializer.save(tenant_id=self.request.user.tenant_id)
        
    @action(detail=True, methods=['post'])
    def mark_completed(self, request, pk=None):
        package = self.get_object()
        
        service_completed.send(
            sender=self.__class__,
            tenant_id=self.request.user.tenant_id,
            package_id=str(package.id),
            price=float(package.package_price)
        )
        return Response({'status': 'Package marked as completed'})

class StaffServiceSkillViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = StaffServiceSkillSerializer

    def get_queryset(self):
        return StaffServiceSkill.objects.for_tenant(self.request.user.tenant_id)

    def perform_create(self, serializer):
        serializer.save(tenant_id=self.request.user.tenant_id)
