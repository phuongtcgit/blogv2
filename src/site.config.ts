// ==========================================================================
// CẤU HÌNH TRUNG TÂM CỦA BLOG — ✏️ CHỈNH CÁC GIÁ TRỊ CẦN ĐIỀN Ở ĐÂY
// ==========================================================================
export const SITE = {
  // ✏️ CẦN ĐIỀN: URL chính thức của blog (Cloudflare Pages domain hoặc custom domain).
  // Không có dấu "/" ở cuối. Ví dụ: 'https://blogv2.pages.dev' hoặc 'https://yourdomain.com'
  url: 'https://YOUR-SITE.pages.dev',

  // ✏️ CẦN ĐIỀN: Tên blog của bạn
  title: 'Blog của tôi',

  // ✏️ CẦN ĐIỀN: Mô tả ngắn (hiện ở trang chủ, RSS, meta description)
  description: 'Suy nghĩ, ghi chép và những điều học được.',

  // ✏️ CẦN ĐIỀN: Tên bạn
  author: 'Tên của bạn',

  // Ảnh OG mặc định 1200×630 (dùng khi bài viết không có ảnh riêng).
  // Đặt trong public/ — có thể thay bằng file tự thiết kế cùng tên.
  // Kèm script sinh ảnh: scripts/make-og-image.py
  ogImage: '/og-default.png',

  // ✏️ (Tùy chọn) Liên kết mạng xã hội — điền URL hoặc để chuỗi rỗng '' để ẩn
  social: {
    email: '',
    github: '',
    mastodon: '',
    twitter: '',
    linkedin: '',
  },

  // Số bài viết hiển thị tối đa ở trang chủ
  recentPosts: 5,
} as const;

export type SocialKey = keyof typeof SITE.social;
