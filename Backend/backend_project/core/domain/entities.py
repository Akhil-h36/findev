from dataclasses import dataclass
from typing import List, Optional


@dataclass
class DeveloperEntity:
    id: Optional[int]
    username: str
    tech_stack_data: dict
    years_experience: int
    images: List[str]
    github_url: Optional[str] = None   # moved up — default None, before bool/str defaults
    is_online: bool = False
    bio: str = ""

    def has_matching_stack(self, other_developer: 'DeveloperEntity') -> bool:
        my_langs    = set(self.tech_stack_data.get('languages', []))
        other_langs = set(other_developer.tech_stack_data.get('languages', []))
        return bool(my_langs & other_langs)

    @property
    def primary_image(self) -> str:
        return self.images[0] if self.images else "default_avatar.png"