# 🚀 DevHub Docker Setup Guide

Hướng dẫn setup hệ thống DevHub gồm Backend, Frontend, PostgreSQL, Redis và Elasticsearch bằng Docker.

---

# 📦 1. Giới thiệu

DevHub là hệ thống fullstack gồm:

* Backend: Node.js (Express / TypeORM)
* Frontend: React / Next.js
* Database: PostgreSQL
* Cache: Redis
* Search engine: Elasticsearch
* Containerization: Docker + Docker Compose

---

# 📁 2. Cấu trúc project

```
devhub/
├── backend/
│   ├── src/
│   ├── Dockerfile
│   ├── .dockerignore
├── frontend/
│   ├── src/
│   ├── Dockerfile
│   ├── .dockerignore
├── docker-compose.yml
├── .env
└── README.md
```

---

# ⚙️ 3. Biến môi trường (.env)

Tạo file `.env` ở root:

```env
# Backend
PORT=4040
NODE_ENV=development

# PostgreSQL
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=devhub
POSTGRES_PASSWORD=devhub123
POSTGRES_DB=devhub_db

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Elasticsearch
ELASTICSEARCH_NODE=http://elasticsearch:9200
```

---

# 🐳 4. Dockerfile

## Backend Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 4040

CMD ["npm", "run", "start"]
```

---

## Frontend Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
```

---

## .dockerignore

```gitignore
node_modules
npm-debug.log
.env
.git
.gitignore
```

---

# 🧩 5. Docker Compose

```yaml
version: '3.9'

services:
  # ================= BACKEND =================
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: devhub-backend
    ports:
      - "4040:4040"
    env_file:
      - .env
    depends_on:
      - postgres
      - redis
      - elasticsearch

  # ================= FRONTEND =================
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: devhub-frontend
    ports:
      - "3000:3000"
    env_file:
      - .env
    depends_on:
      - backend

  # ================= POSTGRES =================
  postgres:
    image: postgres:16
    container_name: devhub-postgres
    restart: always
    environment:
      POSTGRES_USER: devhub
      POSTGRES_PASSWORD: devhub123
      POSTGRES_DB: devhub_db
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  # ================= REDIS =================
  redis:
    image: redis:7
    container_name: devhub-redis
    ports:
      - "6379:6379"

  # ================= ELASTICSEARCH =================
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.12.0
    container_name: devhub-elasticsearch
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"

volumes:
  pgdata:
```

---

# 🚀 6. Chạy project

## Start hệ thống

```bash
docker compose up -d
```

## Stop hệ thống

```bash
docker compose down
```

## Xoá toàn bộ (kèm volume)

```bash
docker compose down -v
```

---

# 🧠 7. Lệnh Docker quan trọng

## Container

```bash
docker ps
docker logs -f container_id
docker exec -it container_name sh
docker stop container_id
docker rm container_id
```

## Image

```bash
docker images
docker build -t name .
docker rmi image_id
```

## System cleanup

```bash
docker system prune -a
```

---

# 🐳 8. Docker Hub (Build & Push)

## Login Docker Hub

```bash
docker login
```

---

## 📦 Backend

### Build image

```bash
docker build -t xuantruongdo/devhub:backend ./backend
```

### Push image

```bash
docker push xuantruongdo/devhub:backend
```

---

## 🎨 Frontend

### Build image

```bash
docker build -t xuantruongdo/devhub:frontend ./frontend
```

### Push image

```bash
docker push xuantruongdo/devhub:frontend
```

---

## 📥 Pull image

```bash
docker pull xuantruongdo/devhub:backend
docker pull xuantruongdo/devhub:frontend
```

---

# ⚡ 9. Ghi nhớ nhanh

* `docker compose up -d` → chạy toàn hệ thống
* `docker ps` → xem container
* `docker logs -f` → debug
* `docker exec -it` → vào container
* `docker build` → build image
* `docker push` → đẩy image lên Docker Hub

---

# 🧭 10. Gợi ý nâng cấp

* Thêm CI/CD (GitHub Actions)
* Tách staging / production environment
* Thêm Nginx reverse proxy
* Thêm SSL (Let’s Encrypt)
* Monitoring (Prometheus + Grafana)

---

🔥 DevHub Docker setup hoàn chỉnh — sẵn sàng deploy!
