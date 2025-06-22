FROM python:3.11-slim

WORKDIR /app

# Копируем файл зависимостей
COPY backend/requirements.txt .

# Устанавливаем системные зависимости и Python пакеты за один RUN
RUN echo "deb http://ftp.de.debian.org/debian bookworm main contrib non-free" > /etc/apt/sources.list && \
    echo "deb http://ftp.de.debian.org/debian bookworm-updates main contrib non-free" >> /etc/apt/sources.list && \
    echo "deb http://security.debian.org/debian-security bookworm-security main contrib non-free" >> /etc/apt/sources.list && \
    apt-get update && apt-get install -y build-essential python3-dev && \
    rm -rf /var/lib/apt/lists/* && \
    pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Копируем исходники приложения
COPY backend/ .

# Запуск приложения
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
