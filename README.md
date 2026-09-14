# blogv2 — Blog cá nhân Astro + Keystatic + Sveltia

Blog tĩnh, tối giản, chuẩn HTML/SEO. Viết bài bằng **Keystatic** (local) hoặc
**Sveltia CMS** (trên web, dùng được cả điện thoại), lưu bài dạng `.mdx` trong
git, deploy tự động lên **Cloudflare Pages**.

- **Astro 5** — build tĩnh 100%, không cần server
- **Keystatic** — admin viết bài khi chạy local (`/keystatic`)
- **Sveltia CMS** — admin viết bài ngay trên web đã deploy (`/admin/`)
- **SEO đầy đủ** — canonical, Open Graph + Twitter Card với ảnh OG riêng cho
  từng bài, sitemap, RSS **đầy đủ nội dung** (đọc trọn bài trong Feedly/Reeder)
- Dark mode theo hệ điều hành, không JavaScript trên blog, image field tích hợp

---

## Mục lục

1. [Yêu cầu & khởi động](#1-yêu-cầu--khởi-động)
2. [✏️ Checklist CẦN ĐIỀN trước khi push](#2-️-checklist-cần-điền-trước-khi-push)
3. [Viết bài — 4 cách](#3-viết-bài--4-cách)
4. [Sveltia CMS — setup admin trên web (làm 1 lần)](#4-sveltia-cms--setup-admin-trên-web-làm-1-lần)
5. [Quy tắc đặt tên file (slug) — đọc kỹ 1 lần](#5-quy-tắc-đặt-tên-file-slug--đọc-kỹ-1-lần)
6. [Hình ảnh — quy ước](#6-hình-ảnh--quy-ước)
7. [Ảnh chia sẻ (OG image)](#7-ảnh-chia-sẻ-og-image)
8. [Frontmatter — các field của bài viết](#8-frontmatter--các-field-của-bài-viết)
9. [Giao diện sáng/tối & màu code](#9-giao-diện-sángtối--màu-code)
10. [Deploy lên Cloudflare Pages](#10-deploy-lên-cloudflare-pages)
11. [Cấu trúc project](#11-cấu-trúc-project)
12. [Nâng cấp sau này](#12-nâng-cấp-sau-này)
13. [Lệnh thường dùng](#13-lệnh-thường-dùng)

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
| 5 | `keystatic.config.ts` | `repo: 'GITHUB_OWNER/GITHUB_REPO'` — chỉ cần khi nâng cấp admin production (mục 12), có thể điền sau |
| 6 | `public/admin/config.yml` | `site_url` — URL blog (giống mục 1); `backend.repo` — dạng `owner/repo`. **Bắt buộc** để Sveltia chạy |
| 7 | `public/favicon.svg` | đang là chữ "B" — thay bằng logo của bạn nếu muốn |
| 8 | `public/og-default.png` | ảnh chia sẻ mặc định 1200×630 — hiện là placeholder, xem [mục 7](#7-ảnh-chia-sẻ-og-image) |
| 9 | `src/pages/about.astro` | nội dung trang Giới thiệu |
| 10 | `src/content/posts/bai-viet-mau-dau-tien.mdx` | bài mẫu — **xoá khi có bài thật** |

## 3. Viết bài — 4 cách

Cả 4 cách đọc/ghi **cùng một bộ file** `src/content/posts/` — chọn theo hoàn
cảnh, không lo mất đồng bộ.

### a) Keystatic local (khuyên dùng khi ở nhà)

1. `npm run dev`
2. Mở **http://127.0.0.1:4321/keystatic**
3. Tạo/sửa bài bằng editor rich-text; ảnh cover upload trực tiếp trong form
4. Keystatic ghi file `.mdx` vào `src/content/posts/` + ảnh vào `public/images/`
5. Commit + push → Cloudflare Pages tự build & deploy (1–2 phút)

### b) Sveltia CMS trên web (khuyên dùng khi đi xa / điện thoại)

Sau khi làm setup một lần ở [mục 4](#4-sveltia-cms--setup-admin-trên-web-làm-1-lần):

1. Mở **https://your-site.pages.dev/admin/**
2. Đăng nhập GitHub (lần đầu dán token, sau đó nhớ đăng nhập)
3. Editor rich-text đủ dùng, upload ảnh, commit thẳng vào GitHub
4. Cloudflare tự deploy

Không cần máy, không cần Node — chỉ cần trình duyệt.

### c) GitHub web (phương án tối giản)

1. Vào repo trên github.com → thư mục `src/content/posts/`
2. **Add file → Create new file**, đặt tên `ten-bai.mdx`
3. Dán frontmatter + nội dung (GitHub có preview markdown, bật tab Preview)
4. Commit → Cloudflare tự deploy

### d) Trực tiếp trên máy

Tạo file `.mdx` trong `src/content/posts/`, frontmatter giống bài mẫu.

## 4. Sveltia CMS — setup admin trên web (làm 1 lần)

Sveltia chạy hoàn toàn ở trình duyệt, thao tác trực tiếp với GitHub API —
không thêm bất kỳ server nào vào blog. Cần setup một lần như sau:

### Bước 1 — Điền 2 chỗ trong `public/admin/config.yml`

- `site_url`: URL blog (giống `src/site.config.ts`)
- `backend.repo`: `owner/repo` của repo GitHub này

### Bước 2 — Tạo GitHub token (đăng nhập bằng token, đơn giản nhất)

1. GitHub → **Settings → Developer settings → Personal access tokens →
   Fine-grained tokens → Generate new token**
2. Đặt tên VD `sveltia-blog`, thời hạn bạn chọn (90 ngày/1 năm)
3. **Repository access:** Only select repositories → chọn repo blog
4. **Permissions:** Contents = **Read and write** (mọi thứ khác để mặc định)
5. Generate → copy token

### Bước 3 — Đăng nhập lần đầu

Mở `/admin/` trên site đã deploy → nút **Sign In with Token** → dán token.
Sveltia lưu token trong trình duyệt (localStorage), các lần sau tự đăng nhập.

> **Token hết hạn** → vào lại GitHub tạo token mới, dán lại. Nếu thấy bất tiện,
> làm bước nâng cấp ở dưới để có nút "Login with GitHub" một cú click.

### (Tùy chọn) Nâng cấp — đăng nhập OAuth qua Cloudflare Worker

Dùng worker chính thức [sveltia/sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth):

1. Tạo **GitHub OAuth App** (Settings → Developer settings → OAuth Apps):
   - Homepage URL: URL blog của bạn
   - Authorization callback URL: `https://sveltia-cms-auth.<SUBDOMAIN>.workers.dev/callback`
2. Bấm nút **Deploy to Cloudflare Workers** trong repo worker → điền biến môi
   trường `GITHUB_CLIENT_ID` (Client ID của OAuth App) và `GITHUB_CLIENT_SECRET`.
   Nên thêm `ALLOWED_DOMAINS` = domain blog của bạn (VD `blogv2.pages.dev, yourdomain.com`).
3. Bỏ comment dòng `base_url` trong `public/admin/config.yml`, điền URL worker.

Sau đó nút đăng nhập là "Login with GitHub" — không cần token tay nữa. Worker
này nằm trong free tier của Cloudflare Workers (100.000 request/ngày).

## 5. Quy tắc đặt tên file (slug) — đọc kỹ 1 lần

Tên file **chính là URL** bài viết: `bai-viet-mau-dau-tien.mdx` →
`/blog/bai-viet-mau-dau-tien/`.

- **Chữ thường, không dấu, cách nhau bằng gạch ngang**:
  `viet-ve-astro.mdx` ✅ — `Viết về Astro.mdx` ❌
- Keystatic tự sinh slug từ tiêu đề; với tiêu đề tiếng Việt **hãy sửa lại slug
  cho không dấu** ngay khi tạo bài (ô "slug" trong form Keystatic; Sveltia đặt
  tên file ở bước tạo mới).
- **Tuyệt đối không đổi tên file sau khi bài đã đăng.** Người khác link tới
  bài của bạn; đổi slug là mất link + traffic. Nếu buộc phải đổi, thêm redirect
  vào file `public/_redirects` (Cloudflare Pages đọc tự động):

  ```
  /blog/ten-cu/   /blog/ten-moi/   301
  ```

## 6. Hình ảnh — quy ước

- Ảnh của bài viết nằm trong **`public/images/<tên-file-bài>/`** — mỗi bài một
  thư mục, không dùng chung (dễ xoá bài mà không phá bài khác). Keystatic và
  Sveltia đều ghi vào đúng thư mục này.
- Chèn ảnh trong nội dung:

  ```markdown
  ![Chú thích ảnh](/images/ten-bai/ten-anh.png)
  ```

- Ảnh trong `public/` được phục vụ nguyên bản. Khi cần tối ưu (WebP/AVIF, tự
  resize), chuyển sang `astro:assets` — xem [mục 12](#12-nâng-cấp-sau-này).

Nên nén ảnh trước khi commit (Squoosh.app hoặc `npx sharp-cli resize`). Ảnh
nặng làm chậm bài viết với người dùng mạng yếu.

## 7. Ảnh chia sẻ (OG image)

Khi bạn chia link lên Facebook/X/Zalo/Slack, mạng xã hội đọc thẻ `og:image`
để hiển thị ảnh preview. Hệ thống xử lý 2 mức:

1. **Mặc định:** mọi trang dùng `public/og-default.png` (1200×630) — cấu hình
   tại `src/site.config.ts` → `ogImage`.
2. **Riêng từng bài:** đặt field `image` trong frontmatter (hoặc upload qua
   Keystatic/Sveltia) → bài đó dùng ảnh riêng, hiện thêm ở đầu bài như ảnh cover.

Khuyến nghị ảnh cover: **1200×630 (tỉ lệ 1.91:1)**, chữ to, ít chi tiết.

File hiện tại là placeholder sinh bằng script (nền tối + tên blog). Muốn đổi:

- Cách nhanh: thay `public/og-default.png` bằng file PNG của bạn (giữ tên).
- Cách bằng script: sửa `TITLE`/`SUBTITLE`/màu trong
  `scripts/make-og-image.py` rồi chạy `python3 scripts/make-og-image.py`
  (cần Pillow: `pip3 install --user --break-system-packages pillow`).
- Lâu dài: tự thiết kế trong Figma/Canva theo khung 1200×630.

Kiểm tra sau khi deploy: dán link bài vào [opengraph.xyz](https://www.opengraph.xyz)
hoặc Sharing Debugger của Facebook.

## 8. Frontmatter — các field của bài viết

| Field | Bắt buộc | Ý nghĩa |
|---|---|---|
| `title` | ✅ | Tiêu đề bài |
| `description` | ✅ | 1–2 câu mô tả — hiện ở meta description, preview khi share, RSS. **Bắt buộc ở cả Keystatic, Sveltia và schema build** |
| `pubDate` | ✅ | Ngày đăng (định dạng `YYYY-MM-DD`) |
| `image` | — | Ảnh cover/OG của bài, VD `/images/ten-bai/cover.png` |
| `tags` | — | Mảng tag, hiển thị ở trang danh sách |
| `draft` | — | `true` = bài nháp, **không được build** ở bất kỳ đâu (kể cả RSS/sitemap) |

> ⚠️ Schema bài viết được khai báo ở **ba nơi** phải khớp nhau:
> `keystatic.config.ts` (form local), `public/admin/config.yml` (Sveltia) và
> `src/content.config.ts` (validation khi build). Sửa một nơi = sửa cả ba.

## 9. Giao diện sáng/tối & màu code

Blog có **3 chế độ hiển thị**, chuyển bằng nút tròn ở góc phải header:

- **Tự động** (mặc định): theo setting sáng/tối của hệ điều hành
- **Sáng** / **Tối**: cố định, ghi nhớ trong `localStorage` của trình duyệt

Vì sao làm vậy: khách vào lần đầu thấy giao diện khớp với máy họ (tự động);
ai muốn cố định thì bấm một lần, blog nhớ mãi. Người dùng tắt JavaScript
thì nút tự ẩn, blog vẫn chạy chế độ tự động bình thường.

Kiến trúc (để hiểu khi chỉnh màu):

- Biến màu nằm ở `src/styles/global.css` — khối `:root` (sáng) và khối
  `:root[data-theme='dark']` / `@media (prefers-color-scheme: dark)` (tối,
  giá trị giống nhau nên luôn đồng bộ). Muốn đổi bảng màu: sửa các biến
  `--bg`, `--text`, `--text-soft`, `--border`, `--accent`, `--code-bg`
  ở **cả hai khối**.
- Nút và logic chuyển nằm trong `src/layouts/BaseLayout.astro` (script
  `is:inline` chạy trước render để không nháy trắng/đen khi tải trang).

### Màu code block

Màu cú pháp dùng Shiki với 2 theme song song: sáng + tối xuất cùng lúc trong
HTML, CSS chọn theme phù hợp theo chế độ hiện tại (kể cả chế độ "tự động").
Đổi cặp theme trong `astro.config.mjs`:

```js
shikiConfig: {
  themes: {
    light: 'github-light',   // ← theme khi blog ở chế độ sáng
    dark: 'github-dark',     // ← theme khi blog ở chế độ tối
  },
},
```

Danh sách theme: [shiki.style/themes](https://shiki.style/themes) — một số
bộ hay dùng: `one-dark-pro`, `catppuccin-latte`/`catppuccin-mocha`,
`min-light`/`min-dark`, `vitesse-light`/`vitesse-dark`. Nên chọn cùng "họ"
sáng/tối cho đồng bộ. Nền block code lấy từ biến `--code-bg` (không lấy nền
của theme Shiki) nên màu code luôn khớp với tổng thể blog.

## 10. Deploy lên Cloudflare Pages

Trong dashboard Cloudflare Pages (bạn đã biết thao tác):

- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Environment variable:** `NODE_VERSION` = `22` (repo đã có `.nvmrc`, nhưng đặt biến này cho chắc)
- Framework preset: **Astro** (nếu có chọn)

Sau khi có domain (VD `xxx.pages.dev` hoặc custom domain), quay lại **mục 2
của checklist** điền `url` (site.config) và `site_url` (admin/config.yml),
commit + push lần nữa để RSS/sitemap/OG sinh link đúng.

## 11. Cấu trúc project

```
src/
  site.config.ts        ← ✏️ cấu hình trung tâm (URL, tên, author, OG mặc định)
  content.config.ts     ← schema frontmatter (phải khớp keystatic + Sveltia)
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
  admin/
    index.html          ← Sveltia CMS (admin trên web)
    config.yml          ← cấu hình Sveltia (✏️ cần điền site_url + repo)
  images/               ← ảnh bài viết (tự tạo thư mục con theo bài)
  og-default.png        ← ảnh OG mặc định
  favicon.svg
  robots.txt
scripts/
  make-og-image.py      ← script sinh lại ảnh OG mặc định
keystatic.config.ts     ← cấu hình CMS local (collection, các field)
astro.config.mjs        ← cấu hình Astro; Keystatic chỉ bật khi `astro dev`
```

## 12. Nâng cấp sau này

**Admin Keystatic ngay trên production:** hiện `/keystatic` chỉ chạy khi
`npm run dev` vì blog build tĩnh. Để bật trên Cloudflare:

1. Tạo **GitHub OAuth App** (Settings → Developer settings), callback
   `https://your-domain.com/api/keystatic/login` → lấy `clientId`/`clientSecret`.
2. Điền `repo` trong `keystatic.config.ts` (đã để placeholder), thêm biến môi
   trường `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`,
   `KEYSTATIC_SECRET`.
3. Thêm adapter: `npm i @astrojs/cloudflare`, thêm `cloudflare()` vào
   `integrations` trong `astro.config.mjs`, đổi dòng
   `...(isDev ? [react(), keystatic()] : [])` thành luôn bật
   `[react(), keystatic()]`.
4. Deploy lên **Cloudflare Workers** (Static Assets) thay vì Pages.

> Thực tế với Sveltia đã có sẵn ở `/admin/`, bước này **chưa cần làm** —
> Sveltia đã phủ hết nhu cầu viết bài từ xa. Chỉ quay lại khi muốn editor
> Keystatic trên production.

**Tối ưu ảnh:** chuyển ảnh bài viết sang `src/assets/` + component `<Image />`
của `astro:assets` (tự sinh WebP/AVIF, width/height chống layout shift).

**Ý tưởng theo thứ tự đáng làm khi cần:** số phút đọc + `updatedDate` → nút
copy code → Cloudflare Web Analytics (miễn phí, 1 dòng script) → giscus bình
luận (GitHub Discussions) → tìm kiếm pagefind. Đề xuất của người "viết blog
lâu năm": **đừng thêm gì cho tới khi thiếu thật sự** — blog mới chết vì
infrastructure nhiều hơn vì thiếu tính năng.

## 13. Lệnh thường dùng

```bash
npm run dev        # chạy local + admin Keystatic (localhost:4321/keystatic)
npm run build      # build tĩnh ra dist/
npm run preview    # xem thử kết quả build
python3 scripts/make-og-image.py   # sinh lại ảnh OG mặc định (cần Pillow)
```
