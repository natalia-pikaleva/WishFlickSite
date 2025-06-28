import os
from dotenv import load_dotenv

load_dotenv()
EMAIL_YANDEX_PASSWORD = os.getenv('EMAIL_YANDEX_PASSWORD', '')
