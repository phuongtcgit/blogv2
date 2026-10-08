---
title: Cập nhật các docker chạy bằng docker-compose
description: Các bước an toàn cập nhật các docker chạy bằng docker-compose
image: ''
pubDate: 2026-10-08
tags:
  - server
draft: false
---

Để cập nhật các Docker container qua `docker-compose` (hoặc `docker compose`) một cách **an toàn**, quy trình tiêu chuẩn bao gồm: kiểm tra log/sức khỏe, sao lưu dữ liệu, kéo (pull) ảnh mới, khởi chạy thử nghiệm hoặc chuyển đổi mượt mà, và dọn dẹp.

**_Docker trên server nhà làm đa số đang ở /opt/docker_**

Dưới đây là bộ lệnh chuẩn chỉnh từng bước:

### Bước 1: Kiểm tra trạng thái hiện tại & Sao lưu (Khuyến nghị)

Trước khi nâng cấp, hãy đảm bảo các container đang chạy bình thường và sao lưu cơ sở dữ liệu/volume (nếu có).

Bash

```plain
# Xem trạng thái các dịch vụ đang chạy
docker compose ps

# (Tùy chọn) Sao lưu cơ sở dữ liệu nếu có (Ví dụ với PostgreSQL/MySQL)
# docker exec -t <container_db_name> pg_dumpall -U <user> > backup.sql
```

### Bước 2: Kéo các Image mới về (Pull) _ Tốt nhất là chạy lệnh trong thư mục chưa file .yml

Lệnh này tải về các phiên bản image mới nhất được khai báo trong file `docker-compose.yml` mà **chưa làm gián đoạn** dịch vụ đang chạy.

Bash

```plain
docker compose pull
```

### Bước 3: Cập nhật và khởi chạy lại container (An toàn)

Chạy lệnh bên dưới để `docker-compose` tự động so sánh image mới tải về với container đang chạy. Chỉ những dịch vụ có image mới hoặc file cấu hình thay đổi mới bị khởi động lại.

Bash

```plain
docker compose up -d
```

> **Mẹo nâng cao (Cập nhật Rolling/Từng service):**Nếu hệ thống của bạn có nhiều dịch vụ và bạn muốn cập nhật từng dịch vụ một để kiểm tra rủi ro:Bashdocker compose up -d --no-deps <ten_service>_(Tham số `--no-deps` giúp không khởi động lại các dịch vụ phụ thuộc vào nó)._

### Bước 4: Kiểm tra log và trạng thái sau khi update

Sau khi container mới được tạo, hãy theo dõi log ngay lập tức để phát hiện lỗi sớm.

Bash

```plain
# Kiểm tra lại trạng thái container (xem có bị Restart/Exited không)
docker compose ps

# Xem log thời gian thực của tất cả service (nhấn Ctrl + C để thoát)
docker compose logs -f --tail=100

# Hoặc xem log của riêng 1 service cụ thể
docker compose logs -f <ten_service>
```

### Bước 5: Dọn dẹp các Image cũ (Chỉ làm khi hệ thống đã ổn định)

Sau khi xác nhận ứng dụng chạy ổn định trên phiên bản mới, dọn dẹp các image không còn được sử dụng để giải phóng dung lượng đĩa.

Bash

```plain
# Xóa các image không dùng (dangling images)
docker image prune -f

# (Cẩn thận) Xóa toàn bộ image thừa không gán cho container nào đang chạy
docker image prune -a -f
```

### Summary tóm tắt (Bộ lệnh nhanh 1-liner):

Nếu bạn đã quen thuộc và muốn thực hiện nhanh quy trình cập nhật:

Bash

```plain
docker compose pull && docker compose up -d && docker image prune -f
```
