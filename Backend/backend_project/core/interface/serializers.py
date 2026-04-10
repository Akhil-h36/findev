from rest_framework import serializers
from core.infrastructure.models import DeveloperModel,ProfileImage


class ProfileImageSerializer(serializers.ModelSerializer):
    class Meta:
        model=ProfileImage
        fields=['id','image','is_primary']
    
class DeveloperProfileSerializer(serializers.ModelSerializer):
    images=ProfileImageSerializer(many=True,read_only=True)
    username=serializers.CharField(source='user.username',read_only=True)


    class META:
        model=DeveloperModel
        fields=['id', 'username', 'bio', 'tech_stack_raw', 'is_online', 'images']
    

    def validateimages(self,value):
        if self.isinstance and self.instance.images.count()>=5:
            raise serializers.ValidationError("you can only have a maximum of 5 profile picture")
        
        return value
    

class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=8)
    phone_number = serializers.CharField(max_length=15)
    tech_stack = serializers.CharField(
        max_length=225,
        help_text="Comma-separated list e.g. Python,Django,React"
    )
 
    def validate_phone_number(self, value):
        if not value.lstrip('+').isdigit():
            raise serializers.ValidationError("Enter a valid phone number.")
        return value
 
 
class VerifyOTPSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=15)
    code = serializers.CharField(min_length=4, max_length=8)
 
 
class ResendOTPSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=15)
 
 
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)