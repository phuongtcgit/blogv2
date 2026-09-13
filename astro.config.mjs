// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import { SITE } from './src/site.config';

// `astro dev` → chạy local (có admin Keystatic); `astro build` → build tĩnh.
// Keystatic cần route SSR nên KHÔNG được đưa vào build tĩnh cho Cloudflare.
// Khi nâng cấp admin trên production (xem README mục "Nâng cấp sau này"),
// đổi thành `true` và thêm adapter Cloudflare.
const isDev = process.argv[2] === 'dev';

// https://astro.build/config
export default defineConfig({
  // ✏️ CẦN ĐIỀN: URL blog nằm trong src/site.config.ts (file này nối sang đó).
  // Bắt buộc đúng để RSS + sitemap sinh link chuẩn.
  site: SITE.url,

  output: 'static',

  integrations: [
    sitemap(),
    mdx(),
    ...(isDev ? [react(), keystatic()] : []),
  ],

  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
  },

  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
});
