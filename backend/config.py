import os
from dotenv import load_dotenv

load_dotenv()
EMAIL_BEGET_PASSWORD = os.getenv('EMAIL_BEGET_PASSWORD', '')
VK_CLIENT_ID = os.getenv('VK_CLIENT_ID', '')
VK_CLIENT_SECRET = os.getenv('VK_CLIENT_SECRET', '')
VK_REDIRECT_URI = os.getenv('VK_REDIRECT_URI', '')
