import re
import secrets
from twilio.rest import Client
from django.conf import settings
from django.core.cache import cache
 
 
class WhatsAppOTPService:
    """
    WhatsApp OTP via Twilio Sandbox (dev) or Twilio Verify API (production).
 
    Settings required in settings.py / .env:
 
        TWILIO_ACCOUNT_SID       = 'ACxxxxxxxx'
        TWILIO_AUTH_TOKEN        = 'your_token'
        TWILIO_WHATSAPP_FROM     = 'whatsapp:+14155238886'  # sandbox number
        TWILIO_USE_SANDBOX       = True    # set False in production
 
        # Production only:
        TWILIO_VERIFY_SID        = 'VAxxxxxxxx'
 
    Cache backend recommendation:
        Use Redis in production — default LocMemCache won't work across
        multiple workers. Add to settings.py:
 
        CACHES = {
            "default": {
                "BACKEND": "django.core.cache.backends.redis.RedisCache",
                "LOCATION": "redis://127.0.0.1:6379/1",
            }
        }
        pip install django-redis
    """
 
    OTP_EXPIRY_SECONDS = 600   # 10 minutes
    OTP_LENGTH         = 6
    RATE_LIMIT_SECONDS = 60    # minimum gap between resends per number
 
    def __init__(self):
        self.client      = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        self.use_sandbox = getattr(settings, 'TWILIO_USE_SANDBOX', False)
        self.verify_sid  = getattr(settings, 'TWILIO_VERIFY_SID', None)
        self.from_number = getattr(settings, 'TWILIO_WHATSAPP_FROM', 'whatsapp:+14155238886')
 
    # ------------------------------------------------------------------ #
    #  Public API                                                          #
    # ------------------------------------------------------------------ #
 
    def send_otp(self, phone_number: str) -> str:
        """
        Sends a WhatsApp OTP to the given number.
 
        Sandbox : generates OTP with secrets module, stores in cache,
                  sends via Twilio Messages API.
        Production : delegates entirely to Twilio Verify (handles
                     generation, delivery, expiry, and retry throttling).
 
        Returns a reference string (cache key or Twilio verification SID).
        Raises RateLimitError if called too soon after a previous send.
        Raises TwilioRestException on Twilio-side failures.
        """
        formatted = self._format_number(phone_number)
        self._check_rate_limit(formatted)       # raises if too soon
 
        if self.use_sandbox:
            return self._send_sandbox_otp(formatted)
        return self._send_verify_otp(formatted)
 
    def verify_otp(self, phone_number: str, code: str) -> bool:
        """
        Verifies the code entered by the user.
        Returns True if correct/approved, False otherwise.
        Raises TwilioRestException on Twilio-side failures (production).
        """
        formatted = self._format_number(phone_number)
 
        if self.use_sandbox:
            return self._verify_sandbox_otp(formatted, code.strip())
        return self._verify_via_twilio(formatted, code.strip())
 
    # ------------------------------------------------------------------ #
    #  Sandbox (dev) implementation                                        #
    # ------------------------------------------------------------------ #
 
    def _send_sandbox_otp(self, formatted_number: str) -> str:
        # secrets.randbelow is cryptographically secure unlike random.randint
        otp = str(secrets.randbelow(10 ** self.OTP_LENGTH)).zfill(self.OTP_LENGTH)
 
        cache_key = self._otp_cache_key(formatted_number)
        cache.set(cache_key, otp, timeout=self.OTP_EXPIRY_SECONDS)
 
        self.client.messages.create(
            from_=self.from_number,
            to=f'whatsapp:{formatted_number}',
            body=(
                f'Your DevMatch verification code is *{otp}*.\n'
                f'It expires in 10 minutes. Do not share it with anyone.'
            )
        )
        # Set rate-limit marker AFTER successful send
        self._set_rate_limit(formatted_number)
        return cache_key
 
    def _verify_sandbox_otp(self, formatted_number: str, code: str) -> bool:
        cache_key = self._otp_cache_key(formatted_number)
        stored_otp = cache.get(cache_key)
 
        if stored_otp and secrets.compare_digest(stored_otp, code):
            cache.delete(cache_key)     # one-time use — invalidate immediately
            return True
        return False
 
    # ------------------------------------------------------------------ #
    #  Production (Twilio Verify) implementation                          #
    # ------------------------------------------------------------------ #
 
    def _send_verify_otp(self, formatted_number: str) -> str:
        verification = (
            self.client.verify.v2
            .services(self.verify_sid)
            .verifications
            .create(to=formatted_number, channel='whatsapp')
        )
        self._set_rate_limit(formatted_number)
        return verification.sid
 
    def _verify_via_twilio(self, formatted_number: str, code: str) -> bool:
        check = (
            self.client.verify.v2
            .services(self.verify_sid)
            .verification_checks
            .create(to=formatted_number, code=code)
        )
        return check.status == 'approved'
 
    # ------------------------------------------------------------------ #
    #  Rate limiting                                                       #
    # ------------------------------------------------------------------ #
 
    def _check_rate_limit(self, formatted_number: str) -> None:
        if cache.get(self._rate_limit_cache_key(formatted_number)):
            raise RateLimitError(
                f'Please wait {self.RATE_LIMIT_SECONDS} seconds before requesting a new OTP.'
            )
 
    def _set_rate_limit(self, formatted_number: str) -> None:
        cache.set(
            self._rate_limit_cache_key(formatted_number),
            True,
            timeout=self.RATE_LIMIT_SECONDS,
        )
 
    # ------------------------------------------------------------------ #
    #  Helpers                                                             #
    # ------------------------------------------------------------------ #
 
    def _format_number(self, phone_number: str) -> str:
        """Strips whitespace and ensures E.164 format e.g. +919876543210"""
        phone_number = re.sub(r'\s+', '', phone_number)
        if not phone_number.startswith('+'):
            return f'+{phone_number}'
        return phone_number
 
    def _otp_cache_key(self, formatted_number: str) -> str:
        return f'whatsapp_otp:{formatted_number}'
 
    def _rate_limit_cache_key(self, formatted_number: str) -> str:
        return f'whatsapp_otp_rl:{formatted_number}'
 
 
# ------------------------------------------------------------------ #
#  Custom exception                                                    #
# ------------------------------------------------------------------ #
 
class RateLimitError(Exception):
    """Raised when OTP is requested too frequently for the same number."""
    pass