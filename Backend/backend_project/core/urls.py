from django.urls import path
from core.interface.views import (
    RegisterView,
    VerifyOTPView,
    ResendOTPView,
    LoginView,
    SwipeView,
    DiscoveryView,
    UpdateTechStackView,
    PhotoUploadView,
    MyProfileView,
    RequestOTPView,
    MathesAndLikesViews,  # FIX: was missing — caused /matches/ to 404
)


urlpatterns=[
    # auth
    path('auth/register/',        RegisterView.as_view(),       name='register'),
    path('auth/verify-otp/',      VerifyOTPView.as_view(),      name='verify-otp'),
    path('auth/resend-otp/',      ResendOTPView.as_view(),      name='resend-otp'),
    path('auth/request-otp/',     RequestOTPView.as_view(),     name='request-otp'),
    path('auth/upload-photos/',   PhotoUploadView.as_view(),    name='upload-photos'),
    path('auth/login/',           LoginView.as_view(),          name='login'),
    path('auth/update-tech-stack/', UpdateTechStackView.as_view(), name='update-tech-stack'),
    path('auth/me/',              MyProfileView.as_view(),      name='my-profile'),

    # app
    path('swipe/<int:target_id>/', SwipeView.as_view(),         name='swipe'),
    path('discover/',              DiscoveryView.as_view(),      name='discovery'),
    path('matches/',               MathesAndLikesViews.as_view(), name='matches'),  # FIX: added
]