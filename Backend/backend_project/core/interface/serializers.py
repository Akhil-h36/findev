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