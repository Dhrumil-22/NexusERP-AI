from rest_framework import serializers
from .models import Service, ServicePackage, StaffServiceSkill

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'
        read_only_fields = ['tenant_id']

class ServicePackageSerializer(serializers.ModelSerializer):
    services_details = ServiceSerializer(source='services', many=True, read_only=True)
    
    class Meta:
        model = ServicePackage
        fields = '__all__'
        read_only_fields = ['tenant_id']

class StaffServiceSkillSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(source='service.name', read_only=True)

    class Meta:
        model = StaffServiceSkill
        fields = '__all__'
        read_only_fields = ['tenant_id']
