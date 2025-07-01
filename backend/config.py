import os
from dotenv import load_dotenv

load_dotenv()
EMAIL_BEGET_PASSWORD = os.getenv('EMAIL_BEGET_PASSWORD', '')
