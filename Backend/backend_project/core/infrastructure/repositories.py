from core.domain.entities import DeveloperEntity
from django.contrib.auth.models import User
from .models import DeveloperModel, OTPVerification


class DeveloperRepository:

    # ------------------------------------------------------------------ #
    # Read-only                                                            #
    # ------------------------------------------------------------------ #

    def get_by_id(self, developer_id: int) -> DeveloperEntity:
        model = DeveloperModel.objects.get(id=developer_id)
        return self._to_entity(model)

    def get_by_phone(self, phone_number: str) -> DeveloperEntity:
        model = DeveloperModel.objects.filter(phone_number=phone_number).first()
        if model is None:
            model = DeveloperModel.objects.filter(
                phone_number=phone_number.lstrip('+')
            ).first()
        if model is None:
            raise DeveloperModel.DoesNotExist(
                f"No developer with phone {phone_number}"
            )
        return self._to_entity(model)

    def get_discovery_list(self, current_user_id):
        user_profile = DeveloperModel.objects.get(id=current_user_id)

        # IDs of people I already liked
        i_liked = DeveloperModel.objects.filter(
            liked_by__id=current_user_id
        ).values_list('id', flat=True)

        # IDs of people I already rejected
        i_rejected = user_profile.rejecters.values_list('id', flat=True)

        # Combine into one exclusion list (including self)
        excluded_ids = set(list(i_liked) + list(i_rejected))
        excluded_ids.add(current_user_id)

        return DeveloperModel.objects.exclude(id__in=excluded_ids)

    def get_matches(self, profile_id: int):
        # People who liked ME and whom I also liked back (mutual)
        # liked_by on a profile = the M2M of people who liked that profile.
        # So: "people who liked me" = profiles where MY id is in their liked_by
        #   = DeveloperModel.objects.filter(liked_by__id=profile_id)
        # AND "I liked them back" = their id appears in liked_by of my profile
        #   = profile.liked_by contains them → filter(liked_by__id=profile_id)
        #   already covers "I liked them" because add_like does target.liked_by.add(swiper)
        #
        # Clearest form: people where BOTH directions of liked_by exist.
        matches = DeveloperModel.objects.filter(
            liked_by__id=profile_id       # I liked them
        ).filter(
            id__in=DeveloperModel.objects.filter(  # they liked me
                liked_by__id=profile_id
            ).values_list('id', flat=True)
        )

        # Use the DB directly: mutual = I liked them AND they liked me
        # "I liked them"   → target.liked_by contains me  → liked_by__id=profile_id on target
        # "They liked me"  → my profile's liked_by contains them
        my_profile = DeveloperModel.objects.get(id=profile_id)

        # People I liked (targets whose liked_by includes me)
        i_liked_ids = DeveloperModel.objects.filter(
            liked_by__id=profile_id
        ).values_list('id', flat=True)

        # People who liked me (my liked_by field)
        they_liked_me_ids = my_profile.liked_by.values_list('id', flat=True)

        # Intersection = mutual matches
        mutual_ids = set(i_liked_ids) & set(they_liked_me_ids)
        return DeveloperModel.objects.filter(id__in=mutual_ids)

    def get_pending_likes(self, profile_id: int):
        my_profile = DeveloperModel.objects.get(id=profile_id)

        # People who liked ME = my profile's liked_by field
        who_liked_me_ids = my_profile.liked_by.values_list('id', flat=True)

        # People I have already liked (I appear in their liked_by)
        i_liked_ids = DeveloperModel.objects.filter(
            liked_by__id=profile_id
        ).values_list('id', flat=True)

        # People I have already rejected
        i_rejected_ids = my_profile.rejecters.values_list('id', flat=True)

        already_processed = set(list(i_liked_ids) + list(i_rejected_ids))

        # Pending = liked me but I haven't acted on them yet
        return DeveloperModel.objects.filter(
            id__in=who_liked_me_ids
        ).exclude(id__in=already_processed)

    # ------------------------------------------------------------------ #
    # Write — profile creation                                             #
    # ------------------------------------------------------------------ #

    def create_user_with_profile(self, username, password, phone_number,
                                 github_url, years_experience, tech_stack_data):
        existing = DeveloperModel.objects.filter(
            phone_number=phone_number, is_phone_verified=False
        ).first()
        if existing:
            existing.user.delete()

        user = User.objects.create_user(username=username, password=password)
        profile = DeveloperModel.objects.create(
            user=user,
            phone_number=phone_number,
            github_url=github_url,
            years_experience=years_experience,
            tech_stack_data=tech_stack_data,
            is_phone_verified=False,
        )
        return self._to_entity(profile)

    def mark_phone_verified(self, phone_number: str) -> None:
        DeveloperModel.objects.filter(phone_number=phone_number).update(
            is_phone_verified=True
        )

    # ------------------------------------------------------------------ #
    # Write — swipe actions                                                #
    # ------------------------------------------------------------------ #

    def add_like(self, swiper_id: int, target_id: int):
        swiper_model = DeveloperModel.objects.get(id=swiper_id)
        target_model = DeveloperModel.objects.get(id=target_id)
        # "swiper liked target" → target's liked_by gets swiper added
        target_model.liked_by.add(swiper_model)

    def check_mutual_like(self, swiper_id: int, target_id: int) -> bool:
        # FIX: old code used swiper.likers / target.likers which are ambiguous
        # reverse accessors. We now use the liked_by M2M field directly.
        #
        # "swiper liked target" → target.liked_by contains swiper
        swiper_liked_target = DeveloperModel.objects.filter(
            id=target_id, liked_by__id=swiper_id
        ).exists()

        # "target liked swiper" → swiper.liked_by contains target
        target_liked_swiper = DeveloperModel.objects.filter(
            id=swiper_id, liked_by__id=target_id
        ).exists()

        return swiper_liked_target and target_liked_swiper

    def add_rejection(self, swiper_id: int, target_id: int):
        swiper_model = DeveloperModel.objects.get(id=swiper_id)
        target_model = DeveloperModel.objects.get(id=target_id)
        swiper_model.rejected_by.add(target_model)

    # ------------------------------------------------------------------ #
    # OTP helpers                                                          #
    # ------------------------------------------------------------------ #

    def save_otp_record(self, phone_number: str, verification_sid: str) -> None:
        OTPVerification.objects.filter(
            phone_number=phone_number, is_used=False
        ).update(is_used=True)
        OTPVerification.objects.create(
            phone_number=phone_number,
            verification_sid=verification_sid,
        )

    def mark_otp_used(self, phone_number: str) -> None:
        OTPVerification.objects.filter(
            phone_number=phone_number, is_used=False
        ).update(is_used=True)

    # ------------------------------------------------------------------ #
    # Private helpers                                                      #
    # ------------------------------------------------------------------ #

    def _to_entity(self, model: DeveloperModel):
        from core.domain.entities import DeveloperEntity
        return DeveloperEntity(
            id=model.id,
            username=model.user.username,
            tech_stack_data=model.tech_stack_data,
            years_experience=model.years_experience,
            images=[{"url": img.image.url, "is_primary": img.is_primary} for img in model.images.all()],
            is_online=model.is_online,
            bio=model.bio,
            github_url=model.github_url,
        )