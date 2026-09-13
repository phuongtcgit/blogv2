import { config, fields, collection } from '@keystatic/core';

export default config({
  // Lưu ý import.meta.env.PROD bên dưới được Vite thay khi build/dev.
  // - Dev (npm run dev): Keystatic chạy chế độ "local", ghi file markdown
  //   trực tiếp vào src/content/posts/ trong máy bạn.
  // - Prod (nếu deploy kèm server runtime): chế độ "repo", ghi qua GitHub API.
  // ✏️ CẦN ĐIỀN: tên repo GitHub dạng "owner/repo" (dùng khi nâng cấp Keystatic
  // lên chế độ GitHub ở production, xem README phần "Nâng cấp sau này").
  storage:
    import.meta.env.PROD
      ? { kind: 'repo', repo: 'GITHUB_OWNER/GITHUB_REPO' }
      : { kind: 'local' },

  collections: {
    posts: collection({
      label: 'Bài viết',
      slugField: 'title',
      // Bài viết là file .mdx (markdown + tùy chọn JSX) chứa frontmatter
      path: 'src/content/posts/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({
          name: { label: 'Tiêu đề', validation: { isRequired: true } },
        }),
        description: fields.text({
          label: 'Mô tả ngắn (1–2 câu, dùng cho SEO + preview khi share)',
          multiline: true,
          validation: { isRequired: true },
        }),
        // Ảnh cover 1200×630+ — dùng làm ảnh OG khi share + hiển thị đầu bài.
        // File ảnh được Keystatic ghi vào public/images/, tham chiếu /images/...
        image: fields.image({
          label: 'Ảnh cover (tùy chọn)',
          directory: 'public/images',
          publicPath: '/images/',
        }),
        pubDate: fields.date({
          label: 'Ngày đăng',
          validation: { isRequired: true },
        }),
        tags: fields.array(fields.text({ label: 'Tag' }), {
          label: 'Thẻ (tags)',
          itemLabel: (props) => props.value || 'Tag mới',
        }),
        draft: fields.checkbox({
          label: 'Bản nháp (ẩn khỏi blog)',
          defaultValue: false,
        }),
        // fields.mdx = trình soạn thảo rich-text, lưu ra markdown trong .mdx
        content: fields.mdx({ label: 'Nội dung' }),
      },
    }),
  },

  // (Có thể thêm "singletons" sau này, ví dụ trang Giới thiệu viết bằng Keystatic)
});
