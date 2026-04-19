# 🔍 Luồng Search User với Elasticsearch

## Tổng quan kiến trúc

```
Client Request
     │
     ▼
UserController.search()
     │
     ▼
UserService.search()
     │
     ▼
SearchService.search()       ◄──── Redis Cache (TTL: 30s)
     │ (cache miss)
     ▼
SearchService.executeQuery()
     │
     ▼
Elasticsearch (index: "users")
     │
     ▼
Trả kết quả về Client
```

---

## 1. Khởi tạo Index (UserSearchIndexService)

Trước khi search được, cần tạo **index** trong Elasticsearch (tương đương `CREATE TABLE` trong SQL).

### Analyzer được cấu hình:

| Analyzer                       | Dùng khi              | Mô tả                                                                                       |
| ------------------------------ | --------------------- | ------------------------------------------------------------------------------------------- |
| `autocomplete_analyzer`        | **Lúc index dữ liệu** | Dùng `edge_ngram` tokenizer, cắt từng prefix của từ (vd: "john" → "j", "jo", "joh", "john") |
| `autocomplete_search_analyzer` | **Lúc search**        | Dùng `standard` tokenizer, giữ nguyên từ người dùng gõ                                      |

> **Tại sao khác nhau?**
> Nếu dùng `edge_ngram` khi search, từ "jo" sẽ được expand thành nhiều token → kết quả nhiễu. Tách riêng để: lúc index thì mở rộng, lúc search thì chính xác.

### Mapping các field chính:

| Field           | Type               | Ghi chú                                                    |
| --------------- | ------------------ | ---------------------------------------------------------- |
| `username`      | `text` + `keyword` | Text để full-text search, keyword để sort/filter chính xác |
| `fullName`      | `text` + `keyword` | Tương tự username                                          |
| `bio`           | `text`             | Chỉ full-text, dùng `standard` analyzer                    |
| `isVerified`    | `boolean`          | Dùng để boost & filter                                     |
| `followerCount` | `integer`          | Dùng để boost theo độ nổi tiếng                            |
| `deletedAt`     | `date`             | Dùng để loại user đã bị xóa                                |
| `avatar`        | `keyword`          | `index: false` — chỉ lưu, không tìm kiếm                   |

---

## 2. Đồng bộ dữ liệu vào Elasticsearch (syncUserToES)

Khi user **đăng ký** mới, hệ thống không ghi trực tiếp vào ES mà đẩy vào **Queue** (BullMQ):

```
register()
  └─► userQueue.add(CREATE_USER_TO_ES, { userId })
            │
            ▼
      UserProcessor (background job)
            │
            ▼
      createUserToES(userId)
            │
            ▼
      es.index(USER_INDEX, document)
```

**Tại sao dùng Queue?**

- Tách biệt luồng đăng ký (nhanh) khỏi luồng đồng bộ ES (chậm hơn)
- Retry tự động nếu ES bị lỗi tạm thời
- Không block response trả về cho user

---

## 3. Luồng Search (SearchService)

### Bước 1 — Kiểm tra cache Redis

```
Nếu cache HIT  → trả về kết quả ngay (cực nhanh)
Nếu cache MISS → tiếp tục xuống ES
```

Cache key có dạng:

```
search:users:{query}:{from}:{size}:{verified|"all"}
```

TTL: **30 giây** (đủ để giảm tải ES, đủ ngắn để dữ liệu không quá cũ)

---

### Bước 2 — Build & Thực thi Query Elasticsearch

Query sử dụng **`function_score`** — cho phép kết hợp text relevance + các yếu tố khác để tính điểm cuối cùng.

#### Cấu trúc query:

```
function_score
├── query (multi_match)          → tính relevance score từ text
└── functions (boosting)         → điều chỉnh thêm điểm số
```

#### Text Matching (multi_match):

```json
{
  "multi_match": {
    "query": "<từ người dùng nhập>",
    "fields": ["username^3", "fullName^2", "bio"],
    "type": "best_fields",
    "fuzziness": "AUTO",
    "prefix_length": 2
  }
}
```

| Tham số             | Ý nghĩa                                         |
| ------------------- | ----------------------------------------------- |
| `username^3`        | username quan trọng gấp 3 lần                   |
| `fullName^2`        | fullName quan trọng gấp 2 lần                   |
| `bio`               | bio có trọng số thấp nhất                       |
| `fuzziness: "AUTO"` | Chấp nhận typo (vd: "johm" vẫn match "john")    |
| `prefix_length: 2`  | 2 ký tự đầu phải đúng (tránh kết quả quá nhiễu) |

#### Filter (bắt buộc áp dụng):

- Loại bỏ user có `deletedAt` (đã bị xóa mềm)
- Nếu truyền `verified=true/false` → lọc thêm theo `isVerified`

#### Boosting Functions:

| Function                                               | Tác dụng                                                                               |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| `field_value_factor(followerCount, log1p, factor=0.5)` | User nhiều follower hơn → điểm cao hơn, nhưng dùng `log1p` để tránh chênh lệch quá lớn |
| `filter(isVerified=true), weight=1.5`                  | User đã verified → nhân điểm thêm 1.5                                                  |

**Công thức tính điểm cuối:**

```
final_score = text_relevance_score × (follower_boost + verified_boost)
              (boost_mode: multiply)   (score_mode: sum)
```

---

## 4. Kết quả trả về

```typescript
{
  hits: UserHit[],   // Danh sách user khớp
  total: number,     // Tổng số kết quả
  took: number       // Thời gian ES xử lý (ms)
}
```

Sau khi lấy từ ES, kết quả được **lưu vào Redis** để phục vụ các request tương tự trong 30 giây tiếp theo.

---

## 5. Tóm tắt toàn bộ luồng

```
[1] User đăng ký
    └─► Lưu DB → Queue → Background sync → Elasticsearch

[2] User search "john"
    └─► Redis cache?
            ├── HIT  → Trả kết quả ngay
            └── MISS → Query Elasticsearch
                           │
                           ├── Filter: loại deletedAt, lọc isVerified nếu cần
                           ├── Match: username (x3) > fullName (x2) > bio
                           ├── Fuzziness: chấp nhận typo
                           ├── Boost: followerCount + isVerified
                           └── Trả kết quả → Lưu Redis → Response
```

---

## 6. Các điểm cần lưu ý khi phát triển tiếp

- **Reindex**: Khi thay đổi mapping, cần reindex toàn bộ dữ liệu (không thể sửa mapping trực tiếp trên index có dữ liệu).
- **Cache invalidation**: Khi user cập nhật profile (username, avatar...), cần xóa cache Redis liên quan hoặc sync lại ES kịp thời.
- **Pagination**: `from + size` không nên vượt quá 10,000 (giới hạn mặc định của ES). Dùng `search_after` nếu cần deep pagination.
- **Index alias**: Nên dùng alias thay vì tên index trực tiếp để dễ reindex không downtime.
