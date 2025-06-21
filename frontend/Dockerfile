FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Для разработки (dev server)
CMD ["npm", "run", "dev"]

# Для продакшена лучше билдить статику:
# RUN npm run build
# И отдавать через nginx или FastAPI
