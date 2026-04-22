# 🚀 DevHub – EC2 Docker Deployment Guide

Hướng dẫn deploy hệ thống **DevHub** lên AWS EC2 bằng Docker + Docker Compose (production-ready basic setup).

---

# 📦 1. Kiến trúc hệ thống

Hệ thống gồm:

* Backend (Node.js)
* Frontend (Next.js / React)
* PostgreSQL
* Redis
* Elasticsearch (optional)

Tất cả chạy bằng **Docker Compose**.

---

# ☁️ 2. Chuẩn bị AWS EC2

## 🔐 Security Group (Inbound Rules)

Mở các port:

| Port | Service          |
| ---- | ---------------- |
| 22   | SSH              |
| 3000 | Frontend         |
| 4040 | Backend          |
| 80   | (optional) Nginx |
| 443  | (optional) HTTPS |

---

# 🖥️ 3. SSH vào EC2

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

---

# 📦 4. Cài Docker & Docker Compose

## Update server

```bash
sudo apt update && sudo apt upgrade -y
```

## Cài Docker

```bash
curl -fsSL https://get.docker.com | sh
```

## Enable Docker

```bash
sudo systemctl enable docker
sudo systemctl start docker
```

## Add user vào docker group

```bash
sudo usermod -aG docker ubuntu
```

👉 Logout SSH rồi login lại

## Cài Docker Compose plugin

```bash
sudo apt install docker-compose-plugin -y
```

## Kiểm tra

```bash
docker compose version
```

---

# 📁 5. Clone project

```bash
git clone https://github.com/xuantruongdo/devhub.git
cd devhub
```

---

# ⚙️ 6. Tạo file môi trường (.env)

```bash
nano .env
```

Ví dụ:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=devhub

ELASTIC_PASSWORD=your_elastic_password
```

---

# 🧠 7. Lưu ý quan trọng

* Bạn đang dùng Docker Hub images → KHÔNG cần build lại
* Service name dùng để connect nội bộ:

  * postgres → `postgres`
  * redis → `redis`

---

# 🚀 8. Run hệ thống

```bash
docker compose up -d
```

---

# 📊 9. Kiểm tra container

```bash
docker ps
```

## Xem logs

```bash
docker logs backend -f
docker logs frontend -f
```

---

# 🌐 10. Test hệ thống

## Frontend

```
http://EC2_PUBLIC_IP:3000
```

## Backend

```
http://EC2_PUBLIC_IP:4040/health
```

---

# ⚠️ 11. Lỗi thường gặp

## ❌ Không connect được database

* Check `.env`
* Check service name trong docker-compose

## ❌ Backend crash

```bash
docker logs backend
```

## ❌ Không truy cập được web

👉 99% do Security Group chưa mở port

## ❌ Out of memory

* EC2 nhỏ (t2.micro/t3.micro)
* Elasticsearch sẽ gây nặng RAM

---

# 🧼 12. Restart hệ thống

```bash
docker compose down
docker compose up -d
```

---

# 💡 13. Gợi ý nâng cấp production

Nên triển khai thêm:

* 🌐 Nginx reverse proxy
* 🔒 HTTPS (Let's Encrypt)
* 🚀 CI/CD (GitHub Actions auto deploy)
* 💾 Backup PostgreSQL volume
* 📊 Monitoring (Prometheus / Grafana)

---

# 🎯 Done

Hệ thống của bạn đã chạy production cơ bản trên EC2 bằng Docker 🚀
