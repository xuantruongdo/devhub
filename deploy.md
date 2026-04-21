# 🚀 DevHub Docker Setup Guide (Backend + Frontend + PostgreSQL + Redis)

Tài liệu này tổng kết cách setup project với Docker, tập trung vào:

* Dockerfile
* `.dockerignore`
* `.env`
* `docker-compose.yml`
* Giải thích **vì sao phải cấu hình như vậy**
* Các lệnh Docker thường dùng

---

# 📦 1. Cấu trúc project

```
devhub/
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── src/
├── frontend/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── ...
├── docker-compose.yml
├── .env
```

---

# 🐳 2. Dockerfile

## Backend (Node.js + TypeScript)

```Dockerfile
FROM node:20-alpine
```

👉 Dùng image nhẹ (alpine) → giảm size, build nhanh hơn

```
WORKDIR /app
```

👉 Set thư mục làm việc trong container

```
COPY package.json pnpm-lock.yaml ./
```

👉 Copy dependency trước để tận dụng **Docker cache**
→ nếu code thay đổi nhưng deps không đổi → không cần cài lại

```
RUN npm install -g pnpm && pnpm install
```

👉 Cài package manager + dependencies

```
COPY . .
```

👉 Copy toàn bộ source code vào container

```
EXPOSE 4040
```

👉 Document port (không phải publish port)

```
CMD ["pnpm", "dev"]
```

👉 Chạy dev server

---

## ❗ Tại sao viết Dockerfile như vậy?

| Quyết định              | Lý do                        |
| ----------------------- | ---------------------------- |
| COPY package.json trước | tận dụng cache → build nhanh |
| dùng alpine             | nhẹ hơn ~80%                 |
| không copy node_modules | tránh conflict OS            |
| CMD dev                 | phù hợp môi trường dev       |

---

## Frontend (Next.js)

```Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

COPY . .

EXPOSE 3000

CMD ["pnpm", "dev"]
```

👉 giống backend → đảm bảo consistency

---

# 🚫 3. .dockerignore (RẤT QUAN TRỌNG)

## backend/.dockerignore

```
node_modules
dist
.git
.env
Dockerfile
docker-compose.yml
```

## frontend/.dockerignore

```
node_modules
.next
.git
.env
```

---

## ❗ Vì sao cần `.dockerignore`?

| Không ignore | Hậu quả             |
| ------------ | ------------------- |
| node_modules | build chậm + lỗi OS |
| .env         | leak secret         |
| .git         | tăng size image     |
| dist/.next   | build lại không cần |

👉 `.dockerignore` giúp:

* build nhanh hơn
* image nhỏ hơn
* bảo mật tốt hơn

---

# 🔐 4. File .env

```env
PORT=4040

POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=devhub
```

---

## ❗ Vì sao dùng `.env`?

* tách config khỏi code
* dễ đổi môi trường (dev / prod)
* dùng chung cho docker-compose

---

# ⚙️ 5. docker-compose.yml

```yaml
services:
  backend:
    build: ./backend
```

👉 build từ Dockerfile local

```
    ports:
      - "4040:4040"
```

👉 map port máy thật → container

```
    env_file:
      - .env
```

👉 inject biến môi trường

```
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
```

👉 **CỰC KỲ QUAN TRỌNG**

| service  | condition | lý do                 |
| -------- | --------- | --------------------- |
| postgres | healthy   | cần DB ready thật     |
| redis    | started   | redis start rất nhanh |

---

## Frontend

```yaml
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
```

👉 frontend chỉ phụ thuộc backend:

```
    depends_on:
      backend:
        condition: service_started
```

---

## PostgreSQL

```yaml
  postgres:
    image: postgres:15
```

👉 dùng image official ổn định

```
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

👉 giữ data khi container restart

```
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
```

👉 đảm bảo DB ready thật

---

## Redis

```yaml
  redis:
    image: redis:7
```

```
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
```

👉 kiểm tra Redis hoạt động

---

## Volumes

```yaml
volumes:
  postgres_data:
```

👉 lưu dữ liệu lâu dài

---

# ❗ Vì sao docker-compose phải viết như vậy?

## 1. Không dùng depends_on kiểu cũ

```yaml
depends_on:
  - postgres ❌
```

👉 chỉ đảm bảo container start
👉 KHÔNG đảm bảo service ready

---

## 2. Phải dùng healthcheck

👉 tránh lỗi:

```
ECONNREFUSED
```

---

## 3. Volume là bắt buộc cho DB

👉 nếu không:

* restart container → mất dữ liệu

---

## 4. Tách service rõ ràng

| Service  | Vai trò        |
| -------- | -------------- |
| backend  | business logic |
| frontend | UI             |
| postgres | database       |
| redis    | cache          |

👉 giúp scale dễ hơn sau này

---

# 🧹 6. Các lệnh Docker quan trọng

## Start

```bash
docker compose up --build -d
```

---

## Stop

```bash
docker compose down

```

---

## Stop + xoá data

```bash
docker compose down -v
```

---

## Logs

```bash
docker compose logs -f backend
```

---

## Vào container

```bash
docker exec -it backend sh
```

---

## Clean toàn bộ Docker

```bash
docker system prune -a --volumes
```

---

# ⚠️ 7. Lỗi thường gặp

## ❌ Database chưa ready

→ backend connect fail

✔ Fix:

* dùng healthcheck
* dùng depends_on đúng

---

## ❌ Build chậm

→ do không có dockerignore

---

## ❌ Port conflict

→ port đã bị chiếm

---

# 🧠 8. Best Practices

* luôn dùng image official
* luôn có healthcheck cho DB
* không commit `.env`
* tận dụng Docker cache
* tách service rõ ràng

---

# 🎯 Kết luận

Setup này đảm bảo:

* chạy ổn định
* tránh race condition (service chưa ready)
* dễ maintain
* dễ scale

👉 Đây là base chuẩn cho:

* SaaS
* microservice
* production-ready backend

---

docker logs <tên_container> dùng để xem log (nhật ký chạy) của một container Docker.

docker inspect <tên_container> dùng để xem toàn bộ thông tin chi tiết (metadata) của container hoặc image trong Docker.

Khác với docker logs (chỉ xem log), thì docker inspect giống như “soi tận ruột” container.

