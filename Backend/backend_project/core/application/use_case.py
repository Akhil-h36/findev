from core.domain.entities import DeveloperEntity
from core.infrastructure.repositories import DeveloperRepository


class SwipeRightUsecase:
    def __init__(self,repository:'DeveloperRepository'):
        self.repository=repository
    def execute(self,swiper_id:int,target_id:int):
        swiper=self.repository.get_by_id(swiper_id)
        target=self.repository.get_by_id(target_id)

        self.repository.add_like(swiper_id,target_id)

        if self.repository.check_mutual_like(target_id,swiper_id):
            return{"status":"match","target":target}
        return {"status":"liked"}

class SwipeleftUsecase:

    def __init__(self,repository:'DeveloperRepository'):

        self.repository=repository

        def execute(self,swiper_id:int,target_id:int):
            self.repository.add_rejection(swiper_id,target_id)
            return {"status":"rejected"}
    