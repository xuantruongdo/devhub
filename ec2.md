# Hướng dẫn tạo EC2 & Fix lỗi Connect (AWS)

Tài liệu tổng hợp toàn bộ quy trình tạo EC2 trên Amazon Web Services và cách xử lý lỗi không connect được.

---

## 1. Tổng quan kiến trúc AWS EC2

Một EC2 instance cần có đủ các thành phần sau:

| Thành phần   | Vai trò          |
|--------------|------------------|
| VPC          | Khu đất (mạng riêng) |
| Subnet       | Khu nhà (khu vực trong VPC) |
| IGW          | Cửa ra Internet  |
| Route Table  | Bản đồ đường     |
| Public IP    | Số nhà           |
| Security Group | Firewall       |

---

## 2. Các bước tạo EC2 đúng chuẩn

### Bước 1 — Tạo EC2

- Vào **EC2 Dashboard** → chọn **Launch Instance**
- Chọn OS: **Ubuntu** (khuyên dùng)
- Chọn instance type: `t2.micro` hoặc `t3.micro`

### Bước 2 — Key Pair (Login)

- Tạo **new key pair**
- Download file `.pem`

> ⚠️ **Không được mất file `.pem` này!**

### Bước 3 — Network Settings

- VPC: chọn `default` hoặc `vpc-test`
- Subnet: chọn **public subnet**
- **Auto-assign Public IP: ENABLE**

### Bước 4 — Security Group

Mở các port sau:

| Loại        | Port | Source      |
|-------------|------|-------------|
| SSH         | 22   | 0.0.0.0/0   |
| HTTP        | 80   | 0.0.0.0/0   |
| HTTPS       | 443  | 0.0.0.0/0   |
| Frontend    | 3000 | 0.0.0.0/0   |
| Backend     | 4040 | 0.0.0.0/0   |

### Bước 5 — Storage

- Loại: **gp3 SSD**
- Dung lượng: **8–30 GB** (an toàn với Free Tier)

### Bước 6 — Launch

- Tạo instance
- Kiểm tra **Public IPv4**

---

## 3. Yêu cầu để EC2 connect được

EC2 phải đảm bảo đủ 4 điều kiện:

- ✅ Có **Public IP**
- ✅ Nằm trong **Public Subnet**
- ✅ Có **Route ra Internet Gateway**
- ✅ **Security Group** mở port 22

---

## 4. Lỗi phổ biến & cách fix

### ❌ Lỗi 1: No Public IPv4

**Nguyên nhân:** Auto-assign Public IP bị tắt khi tạo EC2.

**Fix:** Enable Public IP khi tạo instance.

---

### ❌ Lỗi 2: Instance is not in public subnet

**Nguyên nhân:** Subnet chưa có route ra Internet Gateway.

**Fix:** Thêm route vào Route Table:

```
0.0.0.0/0 → Internet Gateway
```

---

### ❌ Lỗi 3: Failed to connect (SSH / Console)

**Nguyên nhân:**
- Sai file key pair
- Sai username (`ubuntu` vs `ec2-user`)
- Security Group chưa mở port 22

**Fix:**
- Kiểm tra lại file `.pem`
- Dùng đúng username: `ubuntu` (với Ubuntu AMI)

---

### ❌ Lỗi 4: Subnet không public

**Nguyên nhân:** Chưa tạo hoặc chưa attach Internet Gateway.

**Fix:**

1. Tạo **Internet Gateway (IGW)**
2. **Attach** IGW vào VPC
3. Thêm route: `0.0.0.0/0 → IGW`

---

## 5. Internet Gateway (IGW)

IGW là thành phần bắt buộc để EC2 kết nối được Internet.

Các bước thiết lập:

1. Tạo IGW
2. Attach vào VPC
3. Cập nhật Route Table

---

## 6. Route Table chuẩn

```
10.0.0.0/24 → local
0.0.0.0/0   → Internet Gateway
```

---

## 7. Case thực tế

Tình huống đã gặp:

- ✅ EC2 có Public IP
- ✅ Security Group đúng
- ✅ Subnet OK
- ❌ Route thiếu IGW

**Nguyên nhân chính:** Thiếu route đến Internet Gateway.

---

## 8. Fix chuẩn 100%

**Bước 1:** Tạo Internet Gateway

**Bước 2:** Attach vào VPC

**Bước 3:** Cập nhật Route Table:

```
0.0.0.0/0 → IGW
```

**Bước 4:** Restart hoặc launch lại EC2

---

## 9. Kết nối vào EC2

```bash
ssh -i "my-ec2-key.pem" ubuntu@<public_ip>
```

---

## 10. Kết luận

Để EC2 hoạt động đúng, cần đảm bảo **đủ tất cả** các yếu tố sau:

- ✅ Public IP
- ✅ Public Subnet
- ✅ Internet Gateway được attach vào VPC
- ✅ Route `0.0.0.0/0 → IGW` trong Route Table
- ✅ Security Group mở port 22 (và các port cần thiết)

> 💡 **Ghi nhớ nhanh:**
> - Không có IGW = không có internet
> - Không có route = subnet không public
> - Không có Public IP = không SSH được