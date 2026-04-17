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
    GetMatchesUseCase,
    GetPendingLikesUseCase
)

from core.infrastructure.models import ProfileImage
from rest_framework.generics import ListAPIView,RetrieveUpdateAPIView
from core.interface.serializers import (
    RegisterSerializer,
    VerifyOTPSerializer,
    ResendOTPSerializer,
    LoginSerializer,
    DeveloperProfileSerializer,
    PhotoUploadSerializer
)

class RegisterView(APIView):
    """
    POST /api/auth/register/
    Body: { username, password, phone_number, tech_stack_data, github_url, years_experience }

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
                phone_number=data['phone_number'],
                github_url=data.get('github_url', ''),
                years_experience=data.get('years_experience', 0),
                tech_stack=data.get('tech_stack_data', {}),
            )
        except RateLimitError as e:
            return Response({"error": str(e)}, status=429)
        except Exception as e:
            return Response({"error": str(e)}, status=400)

        return Response(result, status=201)


class RequestOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        phone_number = request.data.get('phone_number')
        if not phone_number:
            return Response({"error": "phone_number required"}, status=400)
        otp_service = WhatsAppOTPService()
        try:
            otp_service.send_otp(phone_number)
        except RateLimitError as e:
            return Response({"error": str(e)}, status=429)
        return Response({"status": "otp_sent"})


class VerifyOTPView(APIView):
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
                signup_data=data.get('signup_data', {}),
            )
        except Exception as e:
            return Response({"error": str(e)}, status=500)

        if result['status'] == 'error':
            return Response({"error": result['message']}, status=400)

        return Response(result, status=200)


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
    permission_classes = [IsAuthenticated]

    def post(self, request, target_id):
        action = request.data.get('action')
        repo = DeveloperRepository()

        if action == 'like':
            use_case = SwipeRightUseCase(repo)
        elif action == 'reject':
            use_case = SwipeleftUseCase(repo)
        else:
            return Response({"error": "invalid action"}, status=400)

        swiper_id = request.user.profile.id
        result = use_case.execute(swiper_id, target_id)
        return Response(result)


class DiscoveryView(ListAPIView):
    serializer_class = DeveloperProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        repo = DeveloperRepository()
        use_case = GetDiscoveryProfilesUseCase(repo)
        return use_case.execute(self.request.user.profile.id)


class UpdateTechStackView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        tech_stack = request.data.get('tech_stack')
        if not tech_stack:
            return Response({"error": "tech_stack is required"}, status=400)
        request.user.profile.tech_stack_data = tech_stack
        request.user.profile.save(update_fields=['tech_stack_data'])
        return Response({"status": "updated"})


class PhotoUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PhotoUploadSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        developer = request.user.profile
        images = serializer.validated_data['uploaded_images']

        # Clear existing images if re-uploading during onboarding
        developer.images.all().delete()

        for index, img in enumerate(images):
            ProfileImage.objects.create(
                developer=developer,
                image=img,
                is_primary=(index == 0)
            )

        return Response({"status": "success", "message": "Photos uploaded successfully."})


class MyProfileView(RetrieveUpdateAPIView):
    """Handles GET (fetch own data) and PATCH (update bio/stack/exp)"""
    serializer_class = DeveloperProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user.profile


class MathesAndLikesViews(APIView):
    permission_classes=[IsAuthenticated]

    def get(self,request):
        repo=DeveloperRepository()
        profile_id = request.user.profile.id

        matches=GetMatchesUseCase(repo).execute(profile_id)
        pending=GetPendingLikesUseCase(repo).execute(profile_id)

        ctx = {'request': request}

        # return Response({"matches": DeveloperProfileSerializer(matches, many=True).data,
        #     "pending_likes": DeveloperProfileSerializer(pending, many=True).data})

        return Response({
            "matches":       DeveloperProfileSerializer(matches, many=True, context=ctx).data,
            "pending_likes": DeveloperProfileSerializer(pending, many=True, context=ctx).data,
        })


