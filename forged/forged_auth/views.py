from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status, viewsets, permissions
from django.db import transaction
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterBusinessSerializer, UserSerializer, SessionSerializer, EmployeeSerializer
from .models import Business, User, Session

class RegisterBusinessView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterBusinessSerializer(data=request.data)
        if serializer.is_valid():
            with transaction.atomic():  # type: ignore
                business = Business.objects.create(
                    name=serializer.validated_data['business_name'],
                    industry_tag=serializer.validated_data.get('industry_tag', '')
                )
                user = User.objects.create_user(
                    username=serializer.validated_data['username'],
                    password=serializer.validated_data['password'],
                    email=serializer.validated_data.get('email', ''),
                    business=business,
                    role='Admin'
                )
            return Response({'message': 'Business and Admin user created successfully.'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user is not None:
            refresh = RefreshToken.for_user(user)
            
            # Record Session
            ip = request.META.get('REMOTE_ADDR', '')
            device = request.META.get('HTTP_USER_AGENT', '')
            Session.objects.create(
                business=user.business,
                user=user,
                ip_address=ip,
                device_info=device[:255]
            )
            
            # Fire signal
            from core.events import user_logged_in
            user_logged_in.send(
                sender=self.__class__,
                tenant_id=user.business_id if user.business else None,
                user_id=user.id
            )

            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            })
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)

    def patch(self, request):
        user = request.user
        if 'avatar' in request.FILES:
            import base64
            avatar_file = request.FILES['avatar']
            encoded_string = base64.b64encode(avatar_file.read()).decode('utf-8')
            mime_type = avatar_file.content_type
            user.avatar_base64 = f"data:{mime_type};base64,{encoded_string}"
            user.save()
            return Response(UserSerializer(user).data)
        return Response({"error": "No avatar provided"}, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        new_password = request.data.get('new_password')
        if not new_password:
            return Response({"error": "new_password is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        user = request.user
        user.set_password(new_password)
        user.save()
        return Response({"status": "password reset successfully"})

class SessionViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = SessionSerializer

    def get_queryset(self):
        if not self.request.user.business_id:
            return Session.objects.none()
        return Session.objects.filter(business_id=self.request.user.business_id).order_by('-created_at')

    def destroy(self, request, *args, **kwargs):
        session = self.get_object()
        session.is_active = False
        session.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

class EmployeeViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = EmployeeSerializer

    def get_queryset(self):
        # Only allow Bosses to view employees for their own business
        if self.request.user.role not in ['Admin', 'Manager']:
            return User.objects.none()
        if not self.request.user.business_id:
            return User.objects.none()
        # Return Staff belonging to the same business
        return User.objects.filter(business_id=self.request.user.business_id, role='Staff').order_by('-date_joined')

    def perform_create(self, serializer):
        # Enforce business ID from the logged-in boss
        if self.request.user.role not in ['Admin', 'Manager']:
            raise permissions.PermissionDenied("Only Admin or Manager can create employees.")
        serializer.save(business=self.request.user.business, role='Staff')

    def perform_update(self, serializer):
        if self.request.user.role not in ['Admin', 'Manager']:
            raise permissions.PermissionDenied("Only Admin or Manager can update employees.")
        
        # Prevent updating password through standard update (requires separate endpoint if needed)
        if 'password' in serializer.validated_data:
            password = serializer.validated_data.pop('password')
            user = serializer.save()
            user.set_password(password)
            user.save()
        else:
            serializer.save()

class SuperAdminBusinessListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.business.name != 'Nexus AI Admin':
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        
        businesses = Business.objects.all()
        data = []
        for b in businesses:
            employees = User.objects.filter(business=b)
            data.append({
                'business_id': str(b.business_id),
                'name': b.name,
                'logo': b.logo_base64 if b.logo_base64 else (request.build_absolute_uri(b.logo.url) if b.logo else None),
                'theme_color': b.theme_color,
                'industry_tag': b.industry_tag,
                'ai_prompt': b.ai_prompt or "Not recorded",
                'enabled_modules_count': len(b.enabled_modules) if isinstance(b.enabled_modules, list) else 0,
                'employee_count': employees.count(),
                'usernames': [u.username for u in employees]
            })
        return Response(data)
