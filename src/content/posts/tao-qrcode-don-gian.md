---
title: Tạo QRCode đơn giản
description: Cách tạo QRCode đơn giản, trực tiếp chính xác và không dính quảng cáo
image: /images/dataqr.png
pubDate: 2026-10-19
tags:
  - knowledge
  - kiến thức
draft: false
---

Dạo này thấy bà con hay coi việc tạo QRCode cho vào các văn bản là một loại áp dụng chuyển đổi số, mà ngặt nỗi đi "search Gút gồ" rồi dính các web cho tạo miễn phí nhưng dính quảng cáo. Nên tôi hướng dẫn nhanh 2 cách tạo. Cũng là để ghi nhớ cho mình chớ sau này lại quên.

# Tạo trực tiếp trong Word

Microsoft Word hỗ trợ tạo trực tiếp rất nhiều định dạng Barcode ngay trong trình soạn thảo mà thường bị bỏ qua. Để tạo QRCode trực tiếp trong Word, ngay tại vị trí con trỏ ta làm như sau

Bấm Ctr + F9 (Với laptop có khi là Ctr + Fn + F9 tuỳ cách cài đặt bàn phím) con trỏ sẽ đổi thành **{|}**. Không có tự đánh 2 dấu ngoặc nhọn {} được nhe, vì đây là 1 cấu hình Trường (field) của Word.

Nhập DisplayBarcode "https:blog.phuongtc.com " QR \q 3 vào giữa 2 dấu ngoặc

1. **Đặt con trỏ chuột** tại vị trí bạn muốn hiển thị mã QR trong tài liệu Word.
2. Nhấn tổ hợp phím **`Ctrl` + `F9`** (_Với laptop có khi là Ctr + Fn + F9 tuỳ cách cài đặt bàn phím_) con trỏ sẽ đổi thành {|}. Không có tự đánh 2 dấu ngoặc nhọn {} được nhe, vì đây là 1 cấu hình Trường (field) của Word.
3. Nhập cú pháp sau vào giữa hai dấu ngoặc nhọn:

```plain
DisplayBarcode "https:blog.phuongtc.com" QR \q 3
```

_(Thay thế_ https:blog.phuongtc.com _bằng đường dẫn hoặc văn bản bạn muốn mã hóa)_.

4. Nhấp chuột phải vào dòng lệnh vừa nhập và chọn **Toggle Field Codes** để hiển thị mã QR.

# Tạo QR lưu dưới dạng ảnh

Dán đúng link dưới đây vào trình duyện là sẽ có hình luôn. Sau đó chuột phải -> Save As là dùng được

https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https:blog.phuongtc.com

Thay thế số 150x150 ở tham số **size** để tăng kích thước

Thay thế text sau tham số **data** để truyền đạt thông tin của bạn.
