// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import { SITE } from './src/site.config';

// https://astro.build/config
export default defineConfig({
  // ✏️ CẦN ĐIỀN: URL blog nằm trong src/site.config.ts (file này nối sang đó).
  // Bắt buộc đúng để RSS + sitemap sinh link chuẩn.
  site: SITE.url,

  output: 'static',

  integrations: [sitemap(), mdx()],

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
