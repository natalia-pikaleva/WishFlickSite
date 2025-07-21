from dotenv import load_dotenv
import os

load_dotenv()

API_URL = "https://wishflick.ru"
# API_URL = "http://localhost:8000"

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = "http://localhost:8000/auth/google/callback"  # ваш redirect URI

FACEBOOK_CLIENT_ID = os.getenv("FACEBOOK_CLIENT_ID")
FACEBOOK_CLIENT_SECRET = os.getenv("FACEBOOK_CLIENT_SECRET")
FACEBOOK_REDIRECT_URI = "http://localhost:8000/auth/facebook/callback"  # ваш redirect URI
