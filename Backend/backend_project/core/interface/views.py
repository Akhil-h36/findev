from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from core.infrastructure.repositories import DeveloperRepository
from core.application.use_case import SwipeRightUsecase


class SwipeView(APIView):
    permission_classes=[IsAuthenticated]

    def post(self,request,target_id):

        action=request.data.get('action')
        repo= DeveloperRepository()

        if action =='Like':
            use_case=SwipeRightUsecase(repo)
        elif action == 'reject':
            use_case=SwipeRightUsecase(repo)
        else:
            return Response({"error":"invalid action"} ,status=400)

        swiper_id=request.user.profile.id
        result=use_case.execute(swiper_id,target_id)

        return Response(result)