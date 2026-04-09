from django.urls import path
from core.interface.views import SwipeView


urlpatterns=[
    path('api/swipe/<int:target_id>',SwipeView.as_view(),name='swipe'),
    path('api/profiles/',DiscoveryView.as_view(), name='discovery')
]



