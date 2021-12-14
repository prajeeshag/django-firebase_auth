import json
import os

from django.apps import AppConfig
from django.contrib.auth import get_user_model
from django.core.exceptions import ImproperlyConfigured
from django.conf import settings


class FbPhoneauthConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'fb_phoneauth'
    verbose_name = "FireBase Phone Auth"

    def ready(self) -> None:
        super().ready()
        check_configs()


def check_configs():
    User = get_user_model()
    PHONENUMBER_FIELD = getattr(
        settings, 'FB_PHONENUMBER_FIELD', 'phone_number')
    if not hasattr(User, PHONENUMBER_FIELD):
        raise ImproperlyConfigured(
            "FbPhoneAuthBackend: User model doesn't have an phone number field or if the phone number field as different name than 'phone_number' then set name in FB_PHONENUMBER_FIELD in settings")
    API_CRED_FILE = os.getenv('GOOGLE_APPLICATION_CREDENTIALS', None)
    if not API_CRED_FILE:
        raise ImproperlyConfigured(
            'GOOGLE_APPLICATION_CREDENTIALS environment variable is not set.')
