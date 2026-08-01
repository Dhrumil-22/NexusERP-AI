from rest_framework import serializers
from .models import ModuleDefinition, TenantModule

class ModuleDefinitionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModuleDefinition
        fields = '__all__'

class TenantModuleSerializer(serializers.ModelSerializer):
    manifest = serializers.SerializerMethodField()

    class Meta:
        model = TenantModule
        fields = '__all__'

    def get_manifest(self, obj):
        try:
            mod = ModuleDefinition.objects.get(module_id=obj.module_id)
            return mod.manifest_json
        except ModuleDefinition.DoesNotExist:
            return None
