from core.domain.entities import DeveloperEntity
from django.contrib.auth.models import User
from .models import DeveloperModel,OTPVerification


class DeveloperRepository:

# read only logic

    def get_by_id(self,developer_id:int)->DeveloperEntity:
        model=DeveloperModel.objects.get(id=developer_id)
        return DeveloperEntity(
            id=model.id,
            username=model.user.username,
            tech_stack=model.tech_stack_raw.split(','),
            is_online=model.is_online,
            bio=model.bio
        )


    def get_by_phone(self,phone_number:str)->DeveloperEntity:
        model=DeveloperModel.objects.get(phone_number=phone_number)
        return self._to_entity(model)   


    def get_discovery_list(self,current_user_id):
        user_profile=DeveloperModel.objects.get(id=current_user_id)
        already_swiped=list(user_profile.liked_by.values_list('id',flat=True)+\
                            list(user_profile.rejected_by.values_list('id',flat=True)))
        already_swiped.append(user_profile.id)
        return DeveloperModel.objects.exclude(id__in=already_swiped)


#  write operation -creation of profile


    def create_user_with_profile(self, username: str, password: str,
                                 tech_stack: str, phone_number: str) -> DeveloperEntity:
        user = User.objects.create_user(username=username, password=password)
        profile = DeveloperModel.objects.create(
            user=user,
            phone_number=phone_number,
            tech_stack_raw=tech_stack,
            is_phone_verified=False,        # verified after OTP check
        )
        return self._to_entity(profile)
 
    def mark_phone_verified(self, phone_number: str) -> None:
        DeveloperModel.objects.filter(phone_number=phone_number).update(is_phone_verified=True)

# *****************************************************************************


# the write operation -swipe actions

    def add_like(self,swiper_id:int,target_id:int):
        swiper_model = DeveloperModel.objects.get(id=swiper_id)
        target_model =DeveloperModel.objects.get(id=target_id)
        swiper_model.liked_by.add(target_model)

    def check_mutual_like(self,swiper_id:int,target_id:int)->bool:
        return DeveloperModel.objects.filter(id=swiper_id,liked_by__id=target_id).exists()
    

    def  add_rejection(self,swiper_id:int,target_id:int):
        swiper_model = DeveloperModel.objects.get(id=swiper_id)
        target_model = DeveloperModel.objects.get(id=target_id)
        swiper_model.rejected_by.add(target_model)
    
# otp record helpers

    def save_otp_record(self, phone_number: str, verification_sid: str) -> None:
        """Invalidate old records and save the new Twilio verification SID."""
        OTPVerification.objects.filter(
            phone_number=phone_number, is_used=False
        ).update(is_used=True)
        OTPVerification.objects.create(
            phone_number=phone_number,
            verification_sid=verification_sid,
        )
 
    def mark_otp_used(self, phone_number: str) -> None:
        OTPVerification.objects.filter(
            phone_number=phone_number, is_used=False
        ).update(is_used=True)
    

    
    def _to_entity(self, model: DeveloperModel):
     
        from core.domain.entities import DeveloperEntity
        return DeveloperEntity(
            id=model.id,
            username=model.user.username,
            tech_stack=model.tech_stack_raw.split(','),
            is_online=model.is_online,
            bio=model.bio
        )