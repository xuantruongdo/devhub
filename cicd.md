# 🚀 CI/CD với GitHub Actions + Docker + VPS (EC2)

Deploy tự động khi push code lên GitHub.

---

# 🧭 Kiến trúc

```
GitHub → GitHub Actions → Docker Hub → VPS (EC2) → Docker Compose
```

---

# ⚙️ 1. Chuẩn bị

## 🔐 GitHub Secrets

Vào:

```
Repo → Settings → Secrets → Actions
```

Thêm:

```
DOCKER_USERNAME
DOCKER_PASSWORD   (Docker Access Token)

VPS_HOST
VPS_USER
VPS_SSH_KEY

NEXT_PUBLIC_API_URL
NEXT_PUBLIC_S3_DOMAIN
NEXT_PUBLIC_GOOGLE_CLIENT_ID
NEXT_PUBLIC_GOOGLE_CLIENT_SECRET
NEXT_PUBLIC_GOOGLE_REDIRECT_URI
```

---

## 🐳 Docker Hub

* Tạo account Docker Hub
* Tạo Access Token (không dùng password thường)

---

## 🖥 VPS

* Đã cài Docker + Docker Compose
* Có project tại:

```
~/devhub
```

---

# 🧱 2. Dockerfile (Frontend)

👉 BẮT BUỘC để inject env lúc build

```dockerfile
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_S3_DOMAIN
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ARG NEXT_PUBLIC_GOOGLE_CLIENT_SECRET
ARG NEXT_PUBLIC_GOOGLE_REDIRECT_URI

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_S3_DOMAIN=$NEXT_PUBLIC_S3_DOMAIN
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_GOOGLE_CLIENT_SECRET=$NEXT_PUBLIC_GOOGLE_CLIENT_SECRET
ENV NEXT_PUBLIC_GOOGLE_REDIRECT_URI=$NEXT_PUBLIC_GOOGLE_REDIRECT_URI
```

---

# ⚠️ Quan trọng

```
Next.js dùng ENV tại BUILD TIME (không phải runtime)
```

👉 Nếu không inject → sẽ bị:

```
undefined/api/...
```

---

# 🚀 3. GitHub Actions

Tạo file:

```
.github/workflows/deploy.yml
```

```yaml
name: 🚀 Deploy DevHub

on:
  push:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest
    environment: production

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Login Docker
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      # Build Frontend
      - name: Build & Push FE
        run: |
          docker build \
            --build-arg NEXT_PUBLIC_API_URL=${{ secrets.NEXT_PUBLIC_API_URL }} \
            --build-arg NEXT_PUBLIC_S3_DOMAIN=${{ secrets.NEXT_PUBLIC_S3_DOMAIN }} \
            --build-arg NEXT_PUBLIC_GOOGLE_CLIENT_ID=${{ secrets.NEXT_PUBLIC_GOOGLE_CLIENT_ID }} \
            --build-arg NEXT_PUBLIC_GOOGLE_CLIENT_SECRET=${{ secrets.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET }} \
            --build-arg NEXT_PUBLIC_GOOGLE_REDIRECT_URI=${{ secrets.NEXT_PUBLIC_GOOGLE_REDIRECT_URI }} \
            -t xuantruongdo/devhub:frontend ./frontend

          docker push xuantruongdo/devhub:frontend

      # Build Backend
      - name: Build & Push BE
        run: |
          docker build -t xuantruongdo/devhub:backend ./backend
          docker push xuantruongdo/devhub:backend

  deploy:
    runs-on: ubuntu-latest
    needs: build
    environment: production

    steps:
      - name: Deploy VPS
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd ~/devhub
            docker compose pull
            docker compose run --rm backend pnpm migration:run
            docker compose up -d --remove-orphans
            docker image prune -f
```

---

# 🔄 4. Deploy

Chỉ cần:

```bash
git add .
git commit -m "deploy"
git push
```

---

# 🔥 Flow hoạt động

```
Push code
   ↓
GitHub Actions build Docker
   ↓
Push Docker Hub
   ↓
SSH vào VPS
   ↓
docker compose pull
   ↓
App update 🚀
```

---

# 🚨 Lỗi thường gặp

## ❌ Docker login fail

```
Username and password required
```

👉 thiếu secret hoặc sai tên

---

## ❌ Push fail

```
insufficient scopes
```

👉 Docker token thiếu quyền → tạo lại (Read/Write)

---

## ❌ API undefined

```
undefined/api/...
```

👉 chưa inject env vào build

---

## ❌ CI không đọc env

👉 chưa set:

```
environment: production
```

---

# 🔐 Best Practice

* Không commit `.env.production`
* Dùng GitHub Secrets
* Inject qua `--build-arg`
* Tách frontend/backend build riêng

---

# 🎯 Kết luận

```
CI/CD = GitHub Actions + Docker + SSH VPS
```

✔ Tự động deploy
✔ Không cần build tay
✔ Production-ready

---

# 🚀 Gợi ý nâng cấp

* Tag version (v1, v2, rollback)
* Staging environment
* Zero downtime deploy
* Auto migrate DB

---
