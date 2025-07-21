import os
from dotenv import load_dotenv
import logging

# Папка загрузки картинок для сервера
UPLOAD_DIR = "/var/www/wishflick/uploads" # Для сервера

# Папка загрузки картинок для локальной разработки
# BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")

load_dotenv()
EMAIL_BEGET_PASSWORD = os.getenv('EMAIL_BEGET_PASSWORD', '')
VK_CLIENT_ID = os.getenv('VK_CLIENT_ID', '')
VK_CLIENT_SECRET = os.getenv('VK_CLIENT_SECRET', '')
VK_REDIRECT_URI = os.getenv('VK_REDIRECT_URI', '')
DB_USER=os.getenv('DB_USER', '')
DB_PASSWORD=os.getenv('DB_PASSWORD', '')
DB_HOST=os.getenv('DB_HOST', '')
DB_NAME=os.getenv('DB_NAME', '')

LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "format": "%(asctime)s %(levelname)s %(name)s: %(message)s",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "default",
            "stream": "ext://sys.stdout",
        },
    },
    "loggers": {
        "uvicorn": {
            "handlers": ["console"],
            "level": "DEBUG",
            "propagate": False,
        },
        "uvicorn.error": {
            "handlers": ["console"],
            "level": "DEBUG",
            "propagate": False,
        },
        "uvicorn.access": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,
        },
        "myapp": {
            "handlers": ["console"],
            "level": "DEBUG",
            "propagate": False,
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "WARNING",
    },
}

logging.config.dictConfig(LOGGING_CONFIG)

