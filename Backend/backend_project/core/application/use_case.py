from core.domain.entities import DeveloperEntity
from core.infrastructure.repositories import DeveloperRepository
from core.infrastructure.whatsapp_otp_service import WhatsAppOTPService
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

# user rejistration

class RegisterUserUseCase:
    def __init__(self,repository:'DeveloperRepository',otp_service: 'WhatsAppOTPService'):
        self.repository=repository
        self.otp_service=otp_service
    
    def execute(self, username, password,phone_number,github_url='', years_experience=0,tech_stack=None):
        if tech_stack is None:
            tech_stack = {}
            
        entity = self.repository.create_user_with_profile(
            username=username,
            password=password,
            phone_number=phone_number,
            github_url=github_url,
            years_experience=years_experience,
            tech_stack_data=tech_stack,
        )
        
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

    def execute(self, phone_number: str, code: str, signup_data: dict = {}) -> dict:
        approved = self.otp_service.verify_otp(phone_number, code)

        if not approved:
            return {"status": "error", "message": "Invalid or expired OTP."}

        # Create user only after OTP is confirmed
        entity = self.repository.create_user_with_profile(
            username=signup_data['username'],
            password=signup_data['password'],
            phone_number=phone_number,
            github_url=signup_data.get('github_url', ''),
            years_experience=signup_data.get('years_experience', 0),
            tech_stack_data=signup_data.get('tech_stack_data', {}),
        )

        # Mark phone verified immediately since OTP just passed
        self.repository.mark_phone_verified(phone_number)

        tokens = _generate_tokens_for_user_id(entity.id)

        return {
            "status": "verified",
            "message": "Phone verified. Account created.",
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
        
        if not hasattr(user, 'profile'):
            return {
                "status": "error", 
                "message": "This account does not have a developer profile. Please register again."
            }
        
        if not user.profile.is_phone_verified:
            return {"status": "error", "message": "Phone not verified..."}
 
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
            return {"status": "match", "target_id": target.id, "target_username": target.username}
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
 