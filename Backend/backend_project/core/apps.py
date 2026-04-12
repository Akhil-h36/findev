from django.apps import AppConfig


class CoreConfig(AppConfig):
    name = 'core'

    def ready(self):
        # Explicitly import the models so Django finds them in your subfolder
        import core.infrastructure.models