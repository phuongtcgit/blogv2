import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Bài viết là file markdown/mdx trong src/content/posts/ — đúng chỗ Keystatic ghi.
const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    // Bắt buộc để SEO + preview khi share link (khuyến nghị 1–2 câu)
    description: z.string().min(1),
    // Ảnh cover (public/images/...) — OG image của bài + hero đầu bài
    image: z.string().optional(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };
