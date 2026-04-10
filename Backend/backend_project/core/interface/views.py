from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated,AllowAny

from core.infrastructure.repositories import DeveloperRepository
from core.infrastructure.whatsapp_otp_service import WhatsAppOTPService, RateLimitError

from core.application.use_case import (
    RegisterUserUseCase,
    VerifyOTPUseCase,
    ResendOTPUseCase,
    LoginUseCase,
    SwipeRightUseCase,
    SwipeleftUseCase,
    GetDiscoveryProfilesUseCase,
)

from rest_framework.generics import ListAPIView
from core.interface.serializers import (
    RegisterSerializer,
    VerifyOTPSerializer,
    ResendOTPSerializer,
    LoginSerializer,
    DeveloperProfileSerializer,
)

class RegisterView(APIView):
    """
    POST /api/auth/register/
    Body: { username, password, phone_number, tech_stack }
 
    Creates account and fires a WhatsApp OTP to phone_number.
    Next step: POST /api/auth/verify-otp/
    """
    permission_classes = [AllowAny]
 
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)
 
        data = serializer.validated_data
        repo = DeveloperRepository()
        otp_service = WhatsAppOTPService()
        use_case = RegisterUserUseCase(repo, otp_service)
 
        try:
            result = use_case.execute(
                username=data['username'],
                password=data['password'],
                tech_stack=data['tech_stack'],
                phone_number=data['phone_number'],
            )
        except RateLimitError as e:
            return Response({"error": str(e)}, status=429)
        except Exception as e:
            return Response({"error": str(e)}, status=400)
 
        return Response(result, status=201)
 
 
class VerifyOTPView(APIView):
    """
    POST /api/auth/verify-otp/
    Body: { phone_number, code }
 
    Verifies the WhatsApp OTP. On success returns JWT access + refresh tokens.
    """
    permission_classes = [AllowAny]
 
    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)
 
        data = serializer.validated_data
        repo = DeveloperRepository()
        otp_service = WhatsAppOTPService()
        use_case = VerifyOTPUseCase(repo, otp_service)
 
        try:
            result = use_case.execute(
                phone_number=data['phone_number'],
                code=data['code'],
            )
        except Exception as e:
            return Response({"error": str(e)}, status=400)
 
        status_code = 200 if result['status'] == 'verified' else 400
        return Response(result, status=status_code)
 
 
class ResendOTPView(APIView):
    """
    POST /api/auth/resend-otp/
    Body: { phone_number }
 
    Resends a fresh WhatsApp OTP. Rate limited to once per 60 seconds.
    """
    permission_classes = [AllowAny]
 
    def post(self, request):
        serializer = ResendOTPSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)
 
        repo = DeveloperRepository()
        otp_service = WhatsAppOTPService()
        use_case = ResendOTPUseCase(repo, otp_service)
 
        try:
            result = use_case.execute(phone_number=serializer.validated_data['phone_number'])
        except RateLimitError as e:
            return Response({"error": str(e)}, status=429)
        except Exception as e:
            return Response({"error": str(e)}, status=400)
 
        return Response(result, status=200)
 
 
class LoginView(APIView):
    """
    POST /api/auth/login/
    Body: { username, password }
 
    Returns JWT access + refresh tokens.
    Rejects if phone is not yet verified.
    """
    permission_classes = [AllowAny]
 
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)
 
        data = serializer.validated_data
        repo = DeveloperRepository()
        use_case = LoginUseCase(repo)
        result = use_case.execute(
            username=data['username'],
            password=data['password'],
        )
 
        status_code = 200 if result['status'] == 'success' else 401
        return Response(result, status=status_code)
 
 
 


class SwipeView(APIView):
    permission_classes=[IsAuthenticated]

    def post(self,request,target_id):

        action=request.data.get('action')
        repo= DeveloperRepository()

        if action =='Like':
            use_case=SwipeRightUseCase(repo)
        elif action == 'reject':
            use_case=SwipeRightUseCase(repo)
        else:
            return Response({"error":"invalid action"} ,status=400)

        swiper_id=request.user.profile.id
        result=use_case.execute(swiper_id,target_id)

        return Response(result)

class DiscoveryView(ListAPIView):
    serializer_class = DeveloperProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        repo = DeveloperRepository()
        use_case = GetDiscoveryProfilesUseCase(repo)
        return use_case.execute(self.request.user.profile.id)