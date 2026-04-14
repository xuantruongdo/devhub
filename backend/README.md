# 🚀 Backend Setup (Express + TypeORM + PostgreSQL)

## 📦 Tech Stack

* Node.js + Express
* TypeScript
* TypeORM
* PostgreSQL
* pnpm

---

# ⚙️ Setup Project

## 1. Install dependencies

```bash
pnpm install
```

---

## 2. Setup environment variables

Tạo file `.env`:

```env
PORT=

DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=
```

---

# 🚀 Run Project

## Development

```bash
pnpm dev
```

## Build

```bash
pnpm build
```

## Start production

```bash
pnpm start
```

---

# 🗄️ Database (TypeORM)

## ⚠️ Quan trọng

* `synchronize: false`
* Sử dụng **migration** để quản lý DB

---

# 📂 Migration Commands

## 1. Generate migration (auto từ entity)

```bash
pnpm migration:generate src/migrations/<MigrationName>
```

📌 Ví dụ:

```bash
pnpm migration:generate src/migrations/CreateUserTable
```

---

## 2. Create migration (file trắng)

```bash
pnpm migration:create src/migrations/<MigrationName>
```

📌 Ví dụ:

```bash
pnpm migration:create src/migrations/AddUserTable
```

👉 Dùng khi:

* viết SQL custom
* fix production bug

---

## 3. Run migration

```bash
pnpm migration:run
```

👉 Chạy tất cả migration chưa được apply

---

## 4. Revert migration

```bash
pnpm migration:revert
```

👉 Rollback migration gần nhất

---

## 5. Check migration status

```bash
pnpm typeorm migration:show -d src/config/data-source.ts
```

---

# 🔄 Workflow chuẩn

```bash
1. Sửa entity
2. pnpm migration:generate src/migrations/<name>
3. pnpm migration:run
```

---

# 📁 Cấu trúc thư mục

```
src/
 ├── config/
 │    └── data-source.ts
 ├── entities/
 │    └── user.entity.ts
 ├── migrations/
 ├── server.ts
```

---

# ⚠️ Lưu ý quan trọng

## ❌ Không dùng trong production

```ts
synchronize: true
```

---

## ✅ Nên dùng

```ts
synchronize: false
```

---

## ⚠️ Với ENUM (Postgres)

👉 Migration cần tạo enum trước:

```sql
CREATE TYPE "user_role_enum" AS ENUM ('USER', 'ADMIN');
```

---

# 🧠 Tips

* Migration chạy theo timestamp
* Mỗi lần `revert` chỉ rollback 1 migration
* Không sửa migration đã chạy trong production

---

# 🔥 Troubleshooting

## ❌ Không tạo bảng

✔ Kiểm tra:

* đã chạy `migration:run` chưa
* config `migrations` path đúng chưa
* có lỗi enum không

---

## ❌ Migration không chạy

```bash
pnpm typeorm migration:show -d src/config/data-source.ts
```

---

# 🎯 Scripts

```json
"scripts": {
  "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
  "build": "tsc",
  "start": "node dist/server.js",
  "typeorm": "ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js",

  "migration:generate": "pnpm typeorm migration:generate -d src/config/data-source.ts",
  "migration:create": "pnpm typeorm migration:create",
  "migration:run": "pnpm typeorm migration:run -d src/config/data-source.ts",
  "migration:revert": "pnpm typeorm migration:revert -d src/config/data-source.ts"
}
```

---

# 🚀 Done

👉 Giờ bạn có thể:

* quản lý DB bằng migration
* build backend chuẩn production

---

### ⚠️ Ngrok & CORS Issues

Khi sử dụng **ngrok** để expose backend (ví dụ: `https://xxxx.ngrok.io`), nếu bạn **restart server hoặc thay đổi code backend**, có thể gặp lỗi CORS khi gọi API từ frontend.

🔍 Nguyên nhân:

* Trình duyệt cache CORS / preflight request
* Cookie / session cũ không còn hợp lệ
* Ngrok URL thay đổi nhưng frontend vẫn dùng cache cũ

✅ Cách xử lý nhanh:

* Mở **tab ẩn danh (Incognito)** và gọi lại API
* Hoặc clear cache + cookies của domain ngrok
* Đảm bảo cập nhật đúng `FRONTEND_URL` / `origin` trong backend

💡 Tip:
Mỗi lần restart ngrok hoặc backend, nên test lại bằng tab ẩn danh để tránh lỗi CORS khó debug.
