from django.db import models

from django.contrib.auth.models import User

class DeveloperModel(models.Model):

    user=models.OneToOneField(User,on_delete=models.CASCADE,related_name='profile')
    phone_number = models.CharField(max_length=15, unique=True)
    bio=models.TextField(max_length=500,blank=True)
    ech_stack_data = models.JSONField(default=dict)
    github_url = models.URLField(max_length=255, blank=True, null=True)
    is_online=models.BooleanField(default=False)
    is_phone_verified=models.BooleanField(default=False)
    years_experience = models.PositiveIntegerField(default=0) # Added

    liked_by=models.ManyToManyField(
        'self',
        symmetrical=False,
        related_name='likers',
        blank=True

    )

    rejected_by=models.ManyToManyField(
        'self',
        symmetrical=False,
        related_name='rejecters',
        blank=True
        )

    def __str__(self):
        return self.user.username
    

class ProfileImage(models.Model):
    developer=models.ForeignKey(DeveloperModel, related_name='images',on_delete=models.CASCADE)
    image=models.ImageField(upload_to='profile_pics/')
    is_primary=models.BooleanField(default=False)
    created_at=models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering=['-is_primary','created_at']



class OTPVerification(models.Model):
    phone_number=models.CharField(max_length=15)
    verification_sid=models.CharField(max_length=64)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)
 
    class Meta:
        ordering = ['-created_at']
 
    def __str__(self):
        return f"OTP for {self.phone_number}"