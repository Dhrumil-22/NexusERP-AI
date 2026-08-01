from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework import status
import json
from .serializers import BusinessSetupSerializer

class BusinessSetupView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        business = request.user.business
        if not business:
            return Response({}, status=status.HTTP_200_OK)
        
        data = {
            'business_name': business.name,
            'industry': business.industry_tag,
            'address': business.address,
            'owner_name': business.owner_name,
            'gst_number': business.gst_number,
            'theme_color': business.theme_color,
            'currency': business.currency,
            'timezone': business.timezone,
            'default_tax_rate': business.default_tax_rate,
            'working_hours': business.working_hours,
            'enabled_modules': business.enabled_modules,
        }
        return Response(data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = BusinessSetupSerializer(data=request.data)
        if serializer.is_valid():
            business = request.user.business
            
            # PROTECT SUPERADMIN BUSINESS: Do not overwrite the main Nexus AI Admin business
            if business and business.name == 'Nexus AI Admin':
                return Response(
                    {'error': 'Cannot overwrite the Nexus AI Admin system business. To build a new OS for a client, please log out and register a new business account.'}, 
                    status=status.HTTP_403_FORBIDDEN
                )

            if not business:
                # Create a business for the user if they don't have one
                from forged_auth.models import Business
                business = Business.objects.create(name=serializer.validated_data['business_name'])
                request.user.business = business
                request.user.save()
            
            business.name = serializer.validated_data['business_name']
            business.industry_tag = serializer.validated_data['industry']
            business.address = serializer.validated_data.get('address', business.address)
            business.owner_name = serializer.validated_data.get('owner_name', business.owner_name)
            business.gst_number = serializer.validated_data.get('gst_number', business.gst_number)
            
            if 'currency' in serializer.validated_data:
                business.currency = serializer.validated_data['currency']
            if 'timezone' in serializer.validated_data:
                business.timezone = serializer.validated_data['timezone']
            if 'default_tax_rate' in serializer.validated_data:
                business.default_tax_rate = serializer.validated_data['default_tax_rate']
            if 'working_hours' in serializer.validated_data:
                business.working_hours = serializer.validated_data['working_hours']

            if 'theme_color' in serializer.validated_data:
                business.theme_color = serializer.validated_data['theme_color']
                
            if 'logo' in request.FILES:
                business.logo = request.FILES['logo']
            
            # Save the AI prompt if provided in the payload
            ai_prompt = request.data.get('ai_prompt')
            if ai_prompt:
                business.ai_prompt = ai_prompt

            # If enabled_modules is passed in the payload, save it
            enabled_modules = request.data.get('enabled_modules')
            if enabled_modules:
                if isinstance(enabled_modules, str):
                    try:
                        enabled_modules = json.loads(enabled_modules)
                    except json.JSONDecodeError:
                        pass
                if isinstance(enabled_modules, list):
                    business.enabled_modules = enabled_modules
                    
                    # Sync with new relational module_registry
                    from module_registry.models import TenantModule
                    TenantModule.objects.filter(tenant_id=business.business_id).update(is_enabled=False)
                    for mod in enabled_modules:
                        tm, created = TenantModule.objects.get_or_create(tenant_id=business.business_id, module_id=mod)
                        tm.is_enabled = True
                        tm.save()
                
            business.save()
            
            return Response({'message': 'Business onboarding completed successfully.', 'enabled_modules': business.enabled_modules}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
