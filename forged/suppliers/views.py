from django.core.exceptions import ObjectDoesNotExist
from rest_framework import viewsets, status
from rest_framework.response import Response
from django.http import Http404
from forged_permissions.permissions import HasModulePermission
from .models import Supplier
from .serializers import SupplierSerializer

class SupplierViewSet(viewsets.ViewSet):
    permission_classes = [HasModulePermission]
    required_module = "suppliers"

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            self.required_permission = 'view_suppliers'
        else:
            self.required_permission = 'edit_suppliers'
        return super().get_permissions()

    def get_object(self, pk, business_id):
        try:
            return Supplier.objects.get(id=pk, business_id=business_id)
        except ObjectDoesNotExist:
            raise Http404

    def list(self, request):
        business_id = str(request.user.business.business_id)
        queryset = Supplier.objects(business_id=business_id)
        serializer = SupplierSerializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request):
        business_id = str(request.user.business.business_id)
        serializer = SupplierSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(business_id=business_id)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, pk=None):
        business_id = str(request.user.business.business_id)
        item = self.get_object(pk, business_id)
        serializer = SupplierSerializer(item)
        return Response(serializer.data)

    def update(self, request, pk=None):
        business_id = str(request.user.business.business_id)
        item = self.get_object(pk, business_id)
        serializer = SupplierSerializer(item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        business_id = str(request.user.business.business_id)
        item = self.get_object(pk, business_id)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
