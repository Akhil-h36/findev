from rest_framework import serializers
from core.infrastructure.models import DeveloperModel,ProfileImage


class ProfileImageSerializer(serializers.ModelSerializer):
    url = serializers.ImageField(source='image', read_only=True)
    class Meta:
        model=ProfileImage
        fields=['id','image','is_primary']


class PhotoUploadSerializer(serializers.Serializer):
    # This matches your model's requirement for the images relation
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(max_length=1000000, allow_empty_file=False, use_url=False),
        write_only=True
    )

    def validate_uploaded_images(self, value):
        if len(value) < 3:
            raise serializers.ValidationError("At least 3 pictures are required.")
        return value



    
class DeveloperProfileSerializer(serializers.ModelSerializer):


    username=serializers.CharField(source='user.username',read_only=True)
    images=ProfileImageSerializer(many=True,read_only=True)
    username=serializers.CharField(source='user.username',read_only=True)
    stack = serializers.JSONField(source='tech_stack_data', read_only=True)


    class Meta:
        model=DeveloperModel
        fields = [
            'id', 
            'username', 
            'bio', 
            'stack', # Maps from tech_stack_data
            'is_online', 
            'images', # Matches your ProfileImage relationship
            'github_url', 
            'years_experience'
        ]

    def get_experience(self, obj):
        return f"{obj.years_experience} years"

    def get_initials(self, obj):
        name = obj.user.username
        return [char.upper() for char in name[:2]] if name else ["D", "V"]
    

    def validate_images(self, value):
        if self.isinstance and self.instance.images.count()>=5:
            raise serializers.ValidationError("you can only have a maximum of 5 profile picture")
        
        return value
    

class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=8)
    phone_number = serializers.CharField(max_length=15)
    github_url = serializers.URLField(required=False, allow_blank=True, default='')
    years_experience = serializers.IntegerField(min_value=0)
    tech_stack_data = serializers.JSONField(required=False,default=dict) 

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