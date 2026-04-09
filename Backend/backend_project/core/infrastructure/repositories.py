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