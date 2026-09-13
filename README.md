# blogv2 — Blog cá nhân Astro + Keystatic

Blog tĩnh, tối giản, chuẩn HTML/SEO. Viết bài bằng **Keystatic**, lưu bài dạng
`.mdx` trong git, deploy tự động lên **Cloudflare Pages**.

- **Astro 5** — build tĩnh 100%, không cần server
- **Keystatic** — admin viết bài khi chạy local (`/keystatic`)
- **SEO đầy đủ** — canonical, Open Graph + Twitter Card với ảnh OG riêng cho
  từng bài, sitemap, RSS **đầy đủ nội dung** (đọc trọn bài trong Feedly/Reeder)
- Dark mode theo hệ điều hành, không JavaScript trên blog, image field tích hợp

---

## Mục lục

1. [Yêu cầu & khởi động](#1-yêu-cầu--khởi-động)
2. [✏️ Checklist CẦN ĐIỀN trước khi push](#2-️-checklist-cần-điền-trước-khi-push)
3. [Viết bài — 3 cách](#3-viết-bài--3-cách)
4. [Quy tắc đặt tên file (slug) — đọc kỹ 1 lần](#4-quy-tắc-đặt-tên-file-slug--đọc-kỹ-1-lần)
5. [Hình ảnh — quy ước](#5-hình-ảnh--quy-ước)
6. [Ảnh chia sẻ (OG image)](#6-ảnh-chia-sẻ-og-image)
7. [Frontmatter — các field của bài viết](#7-frontmatter--các-field-của-bài-viết)
8. [Deploy lên Cloudflare Pages](#8-deploy-lên-cloudflare-pages)
9. [Cấu trúc project](#9-cấu-trúc-project)
10. [Nâng cấp sau này](#10-nâng-cấp-sau-này)
11. [Lệnh thường dùng](#11-lệnh-thường-dùng)

---

## 1. Yêu cầu & khởi động

- Node.js **22** (repo có sẵn `.nvmrc` — chỉ cần `nvm use`)
- Git + repo GitHub

```bash
nvm use          # chọn Node 22
npm install
npm run dev      # blog tại http://127.0.0.1:4321, admin tại /keystatic
```

## 2. ✏️ Checklist CẦN ĐIỀN trước khi push

| # | File | Cần điền |
|---|------|----------|
| 1 | `src/site.config.ts` | `url` — URL thật của blog (VD `https://blogv2.pages.dev` hoặc domain riêng). **Bắt buộc đúng**: RSS, sitemap, OG image, canonical đều dựa vào đây |
| 2 | `src/site.config.ts` | `title`, `description`, `author` |
| 3 | `src/site.config.ts` | `social` — điền URL từng mạng hoặc để `''` để ẩn |
| 4 | `src/site.config.ts` | `ogImage` — mặc định `/og-default.png`; muốn khác thì thay file trong `public/` |
| 5 | `keystatic.config.ts` | `repo: 'GITHUB_OWNER/GITHUB_REPO'` — chỉ cần khi nâng cấp admin production (mục 10), có thể điền sau |
| 6 | `public/favicon.svg` | đang là chữ "B" — thay bằng logo của bạn nếu muốn |
| 7 | `public/og-default.png` | ảnh chia sẻ mặc định 1200×630 — hiện là placeholder, xem [mục 6](#6-ảnh-chia-sẻ-og-image) |
| 8 | `src/pages/about.astro` | nội dung trang Giới thiệu |
| 9 | `src/content/posts/bai-viet-mau-dau-tien.mdx` | bài mẫu — **xoá khi có bài thật** |

## 3. Viết bài — 3 cách

### a) Keystatic local (khuyên dùng khi ở nhà)

1. `npm run dev`
2. Mở **http://127.0.0.1:4321/keystatic**
3. Tạo/sửa bài bằng editor rich-text; ảnh cover upload trực tiếp trong form
4. Keystatic ghi file `.mdx` vào `src/content/posts/` + ảnh vào `public/images/`
5. Commit + push → Cloudflare Pages tự build & deploy (1–2 phút)

### b) Từ xa qua GitHub web (máy khác, điện thoại)

1. Vào repo trên github.com → thư mục `src/content/posts/`
2. **Add file → Create new file**, đặt tên `ten-bai.mdx`
3. Dán frontmatter + nội dung (GitHub có preview markdown, bật tab Preview)
4. Commit → Cloudflare tự deploy

Cách này không có editor rich-text, nhưng đủ dùng cho bài chữ; phù hợp khi
ghi nhanh hoặc sửa lỗi chính tả từ xa.

### c) Trực tiếp trên máy

Tạo file `.mdx` trong `src/content/posts/`, frontmatter giống bài mẫu. Có thể
dùng `.md` thuần cũng được (cả hai đều build), nhưng Keystatic chỉ mở/sửa được
bài do nó tạo.

## 4. Quy tắc đặt tên file (slug) — đọc kỹ 1 lần

Tên file **chính là URL** bài viết: `bai-viet-mau-dau-tien.mdx` →
`/blog/bai-viet-mau-dau-tien/`.

- **Chữ thường, không dấu, cách nhau bằng gạch ngang**:
  `viet-ve-astro.mdx` ✅ — `Viết về Astro.mdx` ❌
- Keystatic tự sinh slug từ tiêu đề; với tiêu đề tiếng Việt **hãy sửa lại slug
  cho không dấu** ngay khi tạo bài (ô "slug" trong form).
- **Tuyệt đối không đổi tên file sau khi bài đã đăng.** Người khác link tới
  bài của bạn; đổi slug là mất link + traffic. Nếu buộc phải đổi, thêm redirect
  vào file `public/_redirects` (Cloudflare Pages đọc tự động):

  ```
  /blog/ten-cu/   /blog/ten-moi/   301
  ```

## 5. Hình ảnh — quy ước

- Ảnh của bài viết nằm trong **`public/images/<tên-file-bài>/`** — mỗi bài một
  thư mục, không dùng chung (dễ xoá bài mà không phá bài khác).
- Chèn ảnh trong nội dung:

  ```markdown
  ![Chú thích ảnh](/images/ten-bai/ten-anh.png)
  ```

- Keystatic đã cấu hình image field ghi trực tiếp vào `public/images/` — khi
  upload ảnh cover qua form, nó tự nằm đúng chỗ.
- Ảnh trong `public/` được phục vụ nguyên bản. Khi cần tối ưu (WebP/AVIF, tự
  resize), chuyển sang `astro:assets` — xem [mục 10](#10-nâng-cấp-sau-này).

Nên nén ảnh trước khi commit (Squoosh.app hoặc `npx sharp-cli resize`). Ảnh
nặng làm chậm bài viết với người dùng mạng yếu.

## 6. Ảnh chia sẻ (OG image)

Khi bạn chia link lên Facebook/X/Zalo/Slack, mạng xã hội đọc thẻ `og:image`
để hiển thị ảnh preview. Hệ thống xử lý 2 mức:

1. **Mặc định:** mọi trang dùng `public/og-default.png` (1200×630) — cấu hình
   tại `src/site.config.ts` → `ogImage`.
2. **Riêng từng bài:** đặt field `image` trong frontmatter (hoặc upload qua
   Keystatic) → bài đó dùng ảnh riêng, hiện thêm ở đầu bài như ảnh cover.

Khuyến nghị ảnh cover: **1200×630 (tỉ lệ 1.91:1)**, chữ to, ít chi tiết.

File hiện tại là placeholder sinh bằng script (nền tối + tên blog). Muốn đổi:

- Cách nhanh: thay `public/og-default.png` bằng file PNG của bạn (giữ tên).
- Cách bằng script: sửa `TITLE`/`SUBTITLE`/màu trong
  `scripts/make-og-image.py` rồi chạy `python3 scripts/make-og-image.py`
  (cần Pillow: `pip3 install --user --break-system-packages pillow`).
- Lâu dài: tự thiết kế trong Figma/Canva theo khung 1200×630.

## 7. Frontmatter — các field của bài viết

| Field | Bắt buộc | Ý nghĩa |
|---|---|---|
| `title` | ✅ | Tiêu đề bài |
| `description` | ✅ | 1–2 câu mô tả — hiện ở meta description, preview khi share, RSS. **Keystatic không cho lưu bài thiếu field này** |
| `pubDate` | ✅ | Ngày đăng (định dạng `YYYY-MM-DD`) |
| `image` | — | Ảnh cover/OG của bài, VD `/images/ten-bai/cover.png` |
| `tags` | — | Mảng tag, hiển thị ở trang danh sách |
| `draft` | — | `true` = bài nháp, **không được build** ở bất kỳ đâu (kể cả RSS/sitemap) |

## 8. Deploy lên Cloudflare Pages

Trong dashboard Cloudflare Pages (bạn đã biết thao tác):

- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Environment variable:** `NODE_VERSION` = `22` (repo đã có `.nvmrc`, nhưng đặt biến này cho chắc)
- Framework preset: **Astro** (nếu có chọn)

Sau khi có domain (VD `xxx.pages.dev` hoặc custom domain), quay lại **mục 1
của checklist** điền `url` vào `src/site.config.ts`, commit + push lần nữa để
RSS/sitemap/OG sinh link đúng.

## 9. Cấu trúc project

```
src/
  site.config.ts        ← ✏️ cấu hình trung tâm (URL, tên, author, OG mặc định)
  content.config.ts     ← schema frontmatter (phải khớp với keystatic.config.ts)
  content/posts/        ← bài viết (.mdx)
  layouts/BaseLayout.astro  ← <head> + meta SEO/OG + header/footer
  lib/utils.ts          ← format ngày tiếng Việt, helper URL
  pages/
    index.astro         ← trang chủ (giới thiệu + bài mới)
    blog/index.astro    ← danh sách tất cả bài
    blog/[...slug].astro  ← trang bài viết (cover + article OG)
    about.astro
    404.astro
    rss.xml.js          ← RSS full nội dung (render MDX qua Container API)
styles/global.css       ← toàn bộ CSS (biến màu, sáng/tối, không framework)
public/
  images/               ← ảnh bài viết (tự tạo thư mục con theo bài)
  og-default.png        ← ảnh OG mặc định
  favicon.svg
  robots.txt
scripts/
  make-og-image.py      ← script sinh lại ảnh OG mặc định
keystatic.config.ts     ← cấu hình CMS (collection, các field)
astro.config.mjs        ← cấu hình Astro; Keystatic chỉ bật khi `astro dev`
```

> Lưu ý kiến trúc: `description` và `image` được khai báo **ở hai nơi** —
> `keystatic.config.ts` (form nhập liệu) và `src/content.config.ts` (validation
> khi build). Sửa một bên nhớ sửa bên kia cho khớp.

## 10. Nâng cấp sau này

**Admin Keystatic ngay trên production (viết bài từ trình duyệt, commit thẳng
vào GitHub):** hiện `/keystatic` chỉ chạy khi `npm run dev` vì blog build tĩnh.
Để bật trên Cloudflare:

1. Tạo **GitHub OAuth App** (Settings → Developer settings), callback
   `https://your-domain.com/api/keystatic/login` → lấy `clientId`/`clientSecret`.
2. Điền `repo` trong `keystatic.config.ts` (đã để placeholder), thêm biến môi
   trường `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`,
   `KEYSTATIC_SECRET`.
3. Thêm adapter: `npm i @astrojs/cloudflare`, thêm `cloudflare()` vào
   `integrations` trong `astro.config.mjs`, đổi dòng
   `...(isDev ? [react(), keystatic()] : [])` thành luôn bật
   `[react(), keystatic()]`.
4. Deploy lên **Cloudflare Workers** (Static Assets) thay vì Pages — Pages
   hiện khuyến nghị chuyển sang Workers cho site có SSR route.

**Tối ưu ảnh:** chuyển ảnh bài viết sang `src/assets/` + component `<Image />`
của `astro:assets` (tự sinh WebP/AVIF, width/height chống layout shift).

**Ý tưởng theo thứ tự đáng làm khi cần:** số phút đọc + `updatedDate` → nút
copy code → Cloudflare Web Analytics (miễn phí, 1 dòng script) → giscus bình
luận (GitHub Discussions) → tìm kiếm pagefind. Đề xuất của người "viết blog
lâu năm": **đừng thêm gì cho tới khi thiếu thật sự** — blog mới chết vì
infrastructure nhiều hơn vì thiếu tính năng.

## 11. Lệnh thường dùng

```bash
npm run dev        # chạy local + admin Keystatic (localhost:4321/keystatic)
npm run build      # build tĩnh ra dist/
npm run preview    # xem thử kết quả build
python3 scripts/make-og-image.py   # sinh lại ảnh OG mặc định (cần Pillow)
```
