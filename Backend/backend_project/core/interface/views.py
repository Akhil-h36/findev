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