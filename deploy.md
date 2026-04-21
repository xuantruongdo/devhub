# 🚀 DevHub Docker Setup Guide

Hướng dẫn setup Docker cho hệ thống DevHub gồm Backend, Frontend, PostgreSQL, Redis và Elasticsearch.

---

# 📦 1. Cấu trúc project

```
devhub/
├── backend/
├── frontend/
├── docker-compose.yml
├── .env
```

* `backend/`: Node.js API server
* `frontend/`: UI application
* `docker-compose.yml`: cấu hình toàn bộ services
* `.env`: biến môi trường chung

---

# 🐳 2. Dockerfile & .dockerignore

## Backend & Frontend

Mỗi service cần:

* Dockerfile
* .dockerignore

Ví dụ `.dockerignore`:

```
node_modules
npm-debug.log
.env
.git
.gitignore
```

---

# ⚙️ 3. Docker Compose

Chạy toàn bộ hệ thống:

```bash
docker compose up -d
```

Dừng hệ thống:

```bash
docker compose down
```

Xoá luôn volume:

```bash
docker compose down -v
```

---

# 🧠 4. Các lệnh Docker cơ bản

## 📌 Kiểm tra Docker

```bash
docker --version
docker info
```

---

## 📦 Image

### Xem image

```bash
docker images
```

### Pull image

```bash
docker pull nginx
```

### Build image

```bash
docker build -t my-app .
```

### Xoá image

```bash
docker rmi image_id
```

---

## 🚀 Container

### Chạy container

```bash
docker run nginx
```

### Chạy nền + map port

```bash
docker run -d -p 8080:80 nginx
```

### Xem container đang chạy

```bash
docker ps
```

### Xem tất cả container

```bash
docker ps -a
```

### Stop container

```bash
docker stop container_id
```

### Start container

```bash
docker start container_id
```

### Restart container

```bash
docker restart container_id
```

### Xoá container

```bash
docker rm container_id
```

---

## 📜 Logs & Debug

### Xem logs

```bash
docker logs container_id
```

### Xem logs realtime

```bash
docker logs -f container_id
```

### Inspect container

```bash
docker inspect container_name
```

### Vào container

```bash
docker exec -it container_name sh <docker exec -it backend sh>
```

---

## 🧩 Docker Compose

### Start services

```bash
docker compose up
```

### Chạy nền

```bash
docker compose up -d
```

### Build lại

```bash
docker compose build
```

### Stop

```bash
docker compose down
```

### Stop + xoá volume

```bash
docker compose down -v
```

---

## 💾 Volume

### Xem volume

```bash
docker volume ls
```

### Inspect volume

```bash
docker volume inspect volume_name
```

### Xoá volume

```bash
docker volume rm volume_name
```

---

## 🧹 Dọn rác Docker

### Dọn cơ bản

```bash
docker system prune
```

### Dọn toàn bộ (mạnh tay)

```bash
docker system prune -a
```

---

# ⚡ Ghi nhớ nhanh

* `docker compose up -d` → chạy hệ thống
* `docker ps` → xem container
* `docker logs -f` → debug
* `docker exec -it` → vào container
* `docker inspect` → xem chi tiết cấu hình

---
