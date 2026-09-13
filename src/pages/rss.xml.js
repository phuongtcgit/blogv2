import rss from '@astrojs/rss';
import {
  experimental_AstroContainer as AstroContainer,
} from 'astro/container';
import mdxServerRenderer from '@astrojs/mdx/server.js';
import { getCollection, render } from 'astro:content';
import { SITE } from '../site.config';

// RSS trả FULL NỘI DUNG bài viết (HTML) để người đọc xem trọn trong app RSS.
// Nội dung .mdx/.md được render qua Astro Container API (pattern chính thức
// của Astro cho việc render collection content ngoài trang).
export async function GET(context) {
  const posts = (await getCollection('posts', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );

  const container = await AstroContainer.create();
  container.addServerRenderer({
    name: 'astro:jsx',
    renderer: mdxServerRenderer,
  });

  const items = [];
  for (const post of posts) {
    const { Content } = await render(post);
    const html = await container.renderToString(Content);
    items.push({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.id}/`,
      // Nội dung đầy đủ — app RSS (Feedly, Reeder…) sẽ hiển thị trọn bài
      content: html,
      // Ảnh đại diện của item nếu bài có cover
      image: post.data.image
        ? new URL(post.data.image, context.site ?? SITE.url).toString()
        : undefined,
      categories: post.data.tags,
    });
  }

  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site ?? SITE.url,
    items,
    customData: '<language>vi-vn</language>',
  });
}
