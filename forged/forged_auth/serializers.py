from rest_framework import serializers
from .models import User, Business, Session

class RegisterBusinessSerializer(serializers.Serializer):
    business_name = serializers.CharField(max_length=255)
    industry_tag = serializers.CharField(max_length=100, required=False, allow_blank=True)
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=False, allow_blank=True)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with that username already exists.")
        return value

    def validate_email(self, value):
        if value and User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with that email already exists.")
        return value

    def validate_business_name(self, value):
        if Business.objects.filter(name=value).exists():
            raise serializers.ValidationError("A business with that name already exists.")
        return value

class UserSerializer(serializers.ModelSerializer):
    business_name = serializers.CharField(source='business.name', read_only=True)
    business_owner_name = serializers.CharField(source='business.owner_name', read_only=True)
    business_address = serializers.CharField(source='business.address', read_only=True)
    logo = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()

    def get_logo(self, obj):
        if obj.business and obj.business.logo_base64:
            return obj.business.logo_base64
        if obj.business and obj.business.logo:
            return obj.business.logo.url
        return None
        
    def get_avatar(self, obj):
        if obj.avatar_base64:
            return obj.avatar_base64
        if obj.avatar:
            return obj.avatar.url
        return None
    theme_color = serializers.CharField(source='business.theme_color', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'business_id', 'business_name', 'business_owner_name', 'business_address', 'logo', 'theme_color', 'assigned_modules', 'avatar']

class EmployeeSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'email', 'role', 'assigned_modules']
        
    def create(self, validated_data):
        # We need to manually hash the password, while pulling business from context in view
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

class SessionSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Session
        fields = ['id', 'user', 'username', 'ip_address', 'device_info', 'created_at', 'is_active']
        read_only_fields = ['id', 'created_at']
