---
title: bai-viet-mau-dau-tien
description: Bài viết mẫu để bạn thấy giao diện — hãy xoá nó khi đăng bài thật.
# Ảnh cover tùy chọn — file đặt trong public/images/, đường dẫn bắt đầu bằng /images/
image: /images/bai-viet-mau-dau-tien/cover.png
pubDate: 2026-09-12
tags:
  - thông báo
draft: false
---

Chào mừng bạn đến với blog mới! Đây là bài viết mẫu.

## Cách viết bài

Có hai cách:

1. **Qua giao diện Keystatic (khuyên dùng):** chạy `npm run dev`, mở [http://127.0.0.1:4321/keystatic](http://127.0.0.1:4321/keystatic), tạo bài mới, rồi commit + push.
2. **Từ xa (máy khác, điện thoại):** sửa file `.mdx` trực tiếp trên web GitHub (vào `src/content/posts/` → Add file / chỉnh sửa), GitHub có preview markdown, commit là Cloudflare tự deploy.
3. **Trực tiếp trên máy:** tạo file `.mdx` mới trong `src/content/posts/` với frontmatter giống file này.

> **Lưu ý slug:** tên file chính là URL bài viết. Với tiêu đề tiếng Việt, hãy đặt tên file không dấu, chữ thường, cách nhau bằng gạch ngang (VD `dat-ten-file-nhu-the-nay.mdx`) và **không đổi tên file sau khi bài đã đăng**.

## Định dạng được hỗ trợ

Chữ **đậm**, chữ *nghiêng*, `code nội dòng`, [liên kết](https://astro.build), danh sách, ảnh và cả blockquote:

> Viết ngắn gọn, rõ ràng.

### Đoạn code

```ts
export function hello(name: string) {
  console.log(`Xin chào, ${name}!`);
}
```

Frontmatter bắt buộc: `title`, `description`, `pubDate`. Tùy chọn: `image`, `tags`, `draft: true` (bài nháp sẽ không được build).
