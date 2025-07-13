Получение секретных ключей:  
openssl rand -hex 32

Запустить на сервере при подключении к БД
CREATE TYPE notificationtype AS ENUM ('friend_request', 'message');
