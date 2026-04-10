from core.domain.entities import DeveloperEntity
from core.infrastructure.repositories import DeveloperRepository
from core.infrastructure.whatsapp_otp_service import WhatsAppOTPService
from django.contrib.auth import authenticate


# user rejistration

class RegisterUserUseCase:
    def __init__(self,repository:'DeveloperRepository',otp_service: 'WhatsAppOTPService'):
        self.repository=repository
        self.otp_service=otp_service
    
    def execute(self,username,password,tech_stack,phone_number):
        entity=self.repository.create_user_with_profile(
            username=username, 
            password=password, 
            tech_stack=tech_stack,
            phone_number=phone_number)
        
        verification_sid=self.otp_service.send_otp(phone_number)

        self.repository.save_otp_record(phone_number,verification_sid)

        return {
            "status": "otp_sent",
            "message": "Account created. Please verify your WhatsApp OTP to activate your account.",
            "user_id": entity.id,
        }

# verifying otp

class VerifyOTPUseCase:
    def __init__(self, repository: 'DeveloperRepository',
                 otp_service: 'WhatsAppOTPService'):
        self.repository = repository
        self.otp_service = otp_service
    

    def execute(self,phone_number:str,code:str)->dict:
        approved=self.otp_service.verify_otp(phone_number,code)

        if not approved:
            return {"status":"error" ,"message":"invalid or expired otp"}
        
        self.repository.mark_phone_verified(phone_number)
        self.repository.mark_otp_used(phone_number)


        developer=self.repository.get_by_phone(phone_number)
        tokens=_generate_tokens_for_user_id(developer.id)

        return {
            "status": "verified",
            "message": "Phone verified successfully.",
            **tokens,
        }



#   resend otp use case

class ResendOTPUseCase:
    """Resends a fresh WhatsApp OTP. Twilio Verify handles rate limiting."""
    def __init__(self, repository: 'DeveloperRepository',
                 otp_service: 'WhatsAppOTPService'):
        self.repository = repository
        self.otp_service = otp_service
 
    def execute(self, phone_number: str) -> dict:
        verification_sid = self.otp_service.send_otp(phone_number)
        self.repository.save_otp_record(phone_number, verification_sid)
        return {"status": "otp_sent", "message": "OTP resent via WhatsApp."}


# the login logic

class LoginUseCase:
    def __init__(self,repository:'DeveloperRepository'):
        self.repository=repository

    def execute(self,username:str,password:str)->dict:

        user=authenticate(username=username,password=password)

        if user is None:
            return {"status":"error","message":"invalid credentials"}
        
        if user.profile.is_phone_verified:
            return{
                "status": "error",
                "message": "Phone number not verified. Please complete OTP verification.",
            }
 
        tokens = _generate_tokens_for_django_user(user)
        return {"status": "success", **tokens}



# the swipe right  logic
class SwipeRightUseCase:
    def __init__(self,repository:'DeveloperRepository'):
        self.repository=repository
    def execute(self,swiper_id:int,target_id:int):
        swiper=self.repository.get_by_id(swiper_id)
        target=self.repository.get_by_id(target_id)

        self.repository.add_like(swiper_id,target_id)

        if self.repository.check_mutual_like(target_id,swiper_id):
            return{"status":"match","target":target}
        return {"status":"liked"}

class SwipeleftUseCase:

    def __init__(self,repository:'DeveloperRepository'):

        self.repository=repository

    def execute(self,swiper_id:int,target_id:int):
            self.repository.add_rejection(swiper_id,target_id)
            return {"status":"rejected"}
    
class GetDiscoveryProfilesUseCase:
    def __init__(self,repository:'DeveloperRepository'):
        self.repository=repository
    
    def execute(self,current_user_id:int):
        return self.repository.get_discovery_list(current_user_id)
    

    
#  Internal helpers                                                    #
# ------------------------------------------------------------------ #
 
def _generate_tokens_for_user_id(developer_id: int) -> dict:
    """Generate JWT tokens given a DeveloperModel pk (= profile.id)."""
    from core.infrastructure.models import DeveloperModel
    profile = DeveloperModel.objects.get(id=developer_id)
    return _generate_tokens_for_django_user(profile.user)
 
 
def _generate_tokens_for_django_user(user) -> dict:
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }
 