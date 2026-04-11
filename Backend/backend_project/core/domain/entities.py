from dataclasses import dataclass
from typing import List ,Optional



@dataclass
class DeveloperEntity:
    id:Optional[int]
    username:str
    tech_stack_data: dict
    years_experience: int
    images:List[str]
    is_online:bool=False
    bio:str=""
    github_url: Optional[str]

    def has_matching_stack(self,other_developer:'DeveloperEntity')->bool:
        return any(tech in self.tech_stack for tech in other_developer.tech_stack)
    
    @property
    def primary_image(self)->str:
        return self.images[0] if self.images else "default_avatar.png"
