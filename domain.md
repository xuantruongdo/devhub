# 🚀 Domain → VPS (EC2) + Docker + Nginx + HTTPS (Full Guide)

Setup đầy đủ: **domain → VPS → Docker → HTTPS production**

---

# 🧭 Kiến trúc

```
Browser
  ↓
Cloudflare (DNS + SSL)
  ↓
Nginx (VPS)
  ↓
Docker
  ├── Frontend (3000)
  └── Backend  (4040)
```

---

# 🌐 1. Trỏ domain (Cloudflare)

Vào Cloudflare → DNS:

```
fe-devhub → <EC2_IP> (Proxy ON 🟠)
be-devhub → <EC2_IP> (Proxy ON 🟠)
```

---

# ⚙️ 2. Mở port EC2

```
80 (HTTP)
443 (HTTPS)
```

---

# 🧱 3. Cài Nginx

```bash
sudo apt update
sudo apt install nginx -y
```

---

# 🔧 4. Config Nginx (CHI TIẾT)

## 📁 Tạo file config

```bash
sudo nano /etc/nginx/sites-available/fe-devhub
```

```nginx
server {
    listen 80;
    server_name fe-devhub.truongdo.io.vn;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

---

```bash
sudo nano /etc/nginx/sites-available/be-devhub
```

```nginx
server {
    listen 80;
    server_name be-devhub.truongdo.io.vn;

    location / {
        proxy_pass http://127.0.0.1:4040;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 🔗 Enable config

```bash
sudo ln -s /etc/nginx/sites-available/fe-devhub /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/be-devhub /etc/nginx/sites-enabled/
```

---

## ❌ Xóa default config (tránh conflict)

```bash
sudo rm /etc/nginx/sites-enabled/default
```

---

## 🔍 Kiểm tra & restart

```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

# 🐳 5. Run Docker

```bash
docker compose up -d
```

---

# 🔐 6. Setup HTTPS

Dùng Certbot:

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx
```

✔ nhập email
✔ chọn domain
✔ chọn redirect HTTPS

---

# ⚠️ 7. Lỗi quan trọng (Next.js ENV)

## 💥 Triệu chứng

```
/en/undefined/api/...
```

---

## 🧠 Nguyên nhân

Next.js chỉ load env khi **build**

---

## ✅ Fix

### Tạo file:

```
frontend/.env.production
```

```env
NEXT_PUBLIC_API_URL=https://be-devhub.yourdomain.com
```

---

### Build lại image

```bash
cd frontend
docker build -t your-image .
docker push your-image
```

---

### Deploy lại

```bash
docker compose down
docker compose pull
docker compose up -d
```

---

# 🚨 Lỗi thường gặp

* ❌ Domain không vào → chưa trỏ DNS / chưa mở port
* ❌ 502 → container chưa chạy / sai port
* ❌ undefined API → env chưa build
* ❌ HTTPS lỗi → chưa chạy certbot

---

# 🎯 Kết luận

```
DNS → Nginx → Docker → HTTPS
```

Done ✅
