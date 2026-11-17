import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const englishNavigation = '\n<nav data-english-navigation="auto" aria-label="Điều hướng bài học" style="box-sizing:border-box;max-width:72rem;margin:1rem auto;padding:0 1rem;">\n  <a href="/english/" style="display:inline-block;padding:0.5rem 0.75rem;border:1px solid #bae6fd;border-radius:0.75rem;background:#fff;color:#075985;font:600 14px/1.5 system-ui,sans-serif;text-decoration:none;">← Tất cả bài học English</a>\n</nav>\n';

/** @param {string} html */
export function addEnglishNavigation(html) {
  // Preserve an author's existing return link and avoid duplicates on repeat builds.
  const markup = html.replace(/<!--[\s\S]*?-->|<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  if (/<a\b[^>]*\bhref\s*=\s*(?:"\/english\/?"|'\/english\/?'|\/english\/?(?=[\s>]))/i.test(markup)) return html;
  const body = /<body\b(?:[^>"']|"[^"]*"|'[^']*')*>/i;
  return body.test(html)
    ? html.replace(body, (opening) => opening + englishNavigation)
    : englishNavigation + html;
}

/** @returns {import('astro').AstroIntegration} */
export default function englishNavigationIntegration() {
  return {
    name: 'english-navigation',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const directory = join(fileURLToPath(dir), 'english');
        let files;
        try {
          files = await readdir(directory, { withFileTypes: true });
        } catch (error) {
          if (error.code === 'ENOENT') return;
          throw error;
        }
        let updated = 0;
        for (const file of files) {
          if (!file.isFile() || !/\.html?$/i.test(file.name) || /^index\.html?$/i.test(file.name)) continue;
          const path = join(directory, file.name);
          const html = await readFile(path, 'utf8');
          const result = addEnglishNavigation(html);
          if (result !== html) {
            await writeFile(path, result, 'utf8');
            updated++;
          }
        }
        logger.info(`Added return navigation to ${updated} English lessons.`);
      },
    },
  };
}
