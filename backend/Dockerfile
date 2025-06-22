FROM python:3.11-slim

WORKDIR /app

COPY backend/requirements.txt .

RUN apt-get update && apt-get install -y build-essential python3-dev && \
    rm -rf /var/lib/apt/lists/* && \
    pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Копируем исходники приложения
COPY backend/ .

# Запуск приложения
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
