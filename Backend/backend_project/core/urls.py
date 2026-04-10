from django.urls import path
from core.interface.views import (
    RegisterView,
    VerifyOTPView,
    ResendOTPView,
    LoginView,
    SwipeView,
    DiscoveryView,
)


urlpatterns=[
    # auth

    path('auth/register/',    RegisterView.as_view(),  name='register'),
    path('auth/verify-otp/',  VerifyOTPView.as_view(), name='verify-otp'),
    path('auth/resend-otp/',  ResendOTPView.as_view(), name='resend-otp'),
    path('auth/login/',       LoginView.as_view(),     name='login'),

    # app
    path('swipe/<int:target_id>',SwipeView.as_view(),name='swipe'),
    path('discover/',DiscoveryView.as_view(), name='discovery'),
]



