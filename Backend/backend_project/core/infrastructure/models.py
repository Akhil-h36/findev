from django.db import models

from django.contrib.auth.models import User

class DeveloperModel(models.Model):

    user=models.OneToOneField(User,on_delete=models.CASCADE,related_name='profile')
    bio=models.TextField(max_length=500,blank=True)
    tech_stack_raw=models.CharField(max_length=225)
    is_online=models.BooleanField(default=False)


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
