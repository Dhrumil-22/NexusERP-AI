from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import PermissionDenied
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

import time
import random
import os
import json
import urllib.request

OTP_STORAGE = {}

def send_otp_email(target_email, otp_code, username):
    BREVO_API_KEY = os.environ.get('BREVO_API_KEY', '').strip()
    RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '').strip()
    
    subject = f"Your Login Security OTP: {otp_code} - Nexus ERP"
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px;">
      <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #e5e7eb; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
        <h2 style="color: #15803d; margin-top: 0; font-size: 20px;">Nexus ERP Security</h2>
        <p style="color: #4b5563; font-size: 15px;">Hello <strong>{username}</strong>,</p>
        <p style="color: #4b5563; font-size: 15px; line-height: 1.5;">Use the following One-Time Password (OTP) to complete your login into Nexus ERP. This code is valid for 5 minutes:</p>
        <div style="background: #f0fdf4; border: 1px dashed #16a34a; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
          <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #15803d;">{otp_code}</span>
        </div>
        <p style="color: #9ca3af; font-size: 12px; margin-bottom: 0;">If you did not request this login code, please secure your account immediately.</p>
      </div>
    </body>
    </html>
    """
    
    if BREVO_API_KEY:
        req = urllib.request.Request(
            'https://api.brevo.com/v3/smtp/email',
            data=json.dumps({
                "sender": {"name": "Nexus ERP Security", "email": "dhrumilvaghela22@gmail.com"},
                "to": [{"email": target_email}],
                "subject": subject,
                "htmlContent": html_content
            }).encode('utf-8'),
            headers={'api-key': BREVO_API_KEY, 'Content-Type': 'application/json', 'Accept': 'application/json'},
            method='POST'
        )
        try:
            with urllib.request.urlopen(req) as resp:
                resp.read()
        except Exception as e:
            print(f"Failed to send Brevo OTP email: {e}")
    elif RESEND_API_KEY:
        req = urllib.request.Request(
            'https://api.resend.com/emails',
            data=json.dumps({
                "from": "Nexus ERP Security <onboarding@resend.dev>",
                "to": [target_email],
                "subject": subject,
                "html": html_content
            }).encode('utf-8'),
            headers={'Authorization': f'Bearer {RESEND_API_KEY}', 'Content-Type': 'application/json', 'User-Agent': 'NexusERP/1.0'},
            method='POST'
        )
        try:
            with urllib.request.urlopen(req) as resp:
                resp.read()
        except Exception as e:
            print(f"Failed to send Resend OTP email: {e}")
    else:
        print(f"[DEV] OTP for {username} is: {otp_code}")

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        otp_input = request.data.get('otp')
        
        user = authenticate(username=username, password=password)
        if user is None:
            return Response({'error': 'Invalid username or password'}, status=status.HTTP_401_UNAUTHORIZED)
            
        target_email = getattr(user, 'email', None) or ""
        
        # Cross-check Employee HR model for the most up-to-date email and sync if needed
        try:
            from employee_hr.models import Employee
            emp = Employee.objects.filter(tenant_id=user.tenant_id, first_name=user.first_name, last_name=user.last_name).first()
            if emp and emp.email and emp.email != user.email:
                user.email = emp.email
                user.save(update_fields=['email'])
                target_email = emp.email
        except Exception:
            pass
        
        if not target_email:
            target_email = "dhrumilvaghela22@gmail.com"
        
        # Step 1: No OTP provided -> Generate and send OTP
        if not otp_input:
            otp_code = f"{random.randint(100000, 999999)}"
            OTP_STORAGE[user.username] = {
                'otp': otp_code,
                'expires_at': time.time() + 300
            }
            
            send_otp_email(target_email, otp_code, user.username)
            
            # Mask email for UI
            parts = target_email.split('@')
            masked = (parts[0][0] + "***@" + parts[1]) if len(parts) == 2 and len(parts[0]) > 1 else target_email
            
            return Response({
                'otp_required': True,
                'email_masked': masked,
                'message': f'OTP sent to {masked}'
            })
            
        # Step 2: OTP provided -> Verify OTP
        otp_data = OTP_STORAGE.get(user.username)
        if not otp_data or time.time() > otp_data.get('expires_at', 0):
            return Response({'error': 'OTP has expired or is invalid. Please request a new code.'}, status=status.HTTP_400_BAD_REQUEST)
            
        if str(otp_data.get('otp')).strip() != str(otp_input).strip():
            return Response({'error': 'Incorrect OTP code. Please check your email and try again.'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Clear used OTP
        if user.username in OTP_STORAGE:
            del OTP_STORAGE[user.username]
            
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

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)

    def patch(self, request):
        user = request.user
        updated = False
        email_val = request.data.get('email') or request.POST.get('email')
        if email_val:
            user.email = str(email_val).strip()
            updated = True
        if 'avatar' in request.FILES:
            import base64
            avatar_file = request.FILES['avatar']
            encoded_string = base64.b64encode(avatar_file.read()).decode('utf-8')
            mime_type = avatar_file.content_type
            user.avatar_base64 = f"data:{mime_type};base64,{encoded_string}"
            updated = True
        if updated:
            user.save()
            return Response(UserSerializer(user).data)
        return Response({"error": "No valid data provided for update"}, status=status.HTTP_400_BAD_REQUEST)

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
            raise PermissionDenied("Only Admin or Manager can create employees.")
        serializer.save(business=self.request.user.business, role='Staff')

    def perform_update(self, serializer):
        if self.request.user.role not in ['Admin', 'Manager']:
            raise PermissionDenied("Only Admin or Manager can update employees.")
        
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
        
        from customer_care.models import SupportTicket
        businesses = Business.objects.all()
        data = []
        for b in businesses:
            employees = User.objects.filter(business=b)
            unread_tickets = SupportTicket.objects.filter(tenant=b, status='open').count()
            data.append({
                'business_id': str(b.business_id),
                'name': b.name,
                'logo': b.logo_base64 if b.logo_base64 else (request.build_absolute_uri(b.logo.url) if b.logo else None),
                'theme_color': b.theme_color,
                'industry_tag': b.industry_tag,
                'ai_prompt': b.ai_prompt or "Not recorded",
                'enabled_modules_count': len(b.enabled_modules) if isinstance(b.enabled_modules, list) else 0,
                'employee_count': employees.count(),
                'usernames': [u.username for u in employees],
                'unread_support_tickets_count': unread_tickets
            })
        return Response(data)

class SuperAdminBusinessTicketsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, business_id):
        if request.user.business.name != 'Nexus AI Admin':
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        
        from customer_care.models import SupportTicket
        tickets = SupportTicket.objects.filter(tenant_id=business_id).order_by('-created_at')
        
        data = []
        for t in tickets:
            data.append({
                'id': str(t.id),
                'message': t.message,
                'ai_response': t.ai_response,
                'status': t.status,
                'created_at': t.created_at,
                'user': t.user.username
            })
        return Response(data)
