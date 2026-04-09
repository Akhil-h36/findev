from core.domain.entities import DeveloperEntity

from .models import DeveloperModel


class DeveloperRepository:
    def get_by_id(self,developer_id:int)->DeveloperEntity:
        model=DeveloperModel.objects.get(id=developer_id)
        return DeveloperEntity(
            id=model.id,
            username=model.user.username,
            tech_stack=model.tech_stack_raw.split(''),
            is_online=model.is_online,
            bio=model.bio
        )


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
    

    def get_discovery_list(self,current_user_id):
        user_profile=DeveloperModel.objects.get(id=current_user_id)
        already_swiped=list(user_profile.liked_by.values_list('id',flat=True)+\
                            list(user_profile.rejected_by.values_list('id',flat=True)))
        already_swiped.append(user_profile.id)
        return DeveloperModel.objects.exclude(id__in=already_swiped)