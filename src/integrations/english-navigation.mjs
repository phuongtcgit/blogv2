import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getEnglishReturnTarget } from '../lib/english-grades.ts';
import { ENGLISH_WORKBOOKS } from '../lib/english-workbooks.ts';

/** @param {string} [path] */
export function englishNavigationForPath(path = '') {
  const { url, label } = getEnglishReturnTarget(path);
  return `\n<nav data-english-navigation="auto" aria-label="Điều hướng bài học" style="box-sizing:border-box;max-width:72rem;margin:1rem auto;padding:0 1rem;">\n  <a href="${url}" style="display:inline-block;padding:0.5rem 0.75rem;border:1px solid #bae6fd;border-radius:0.75rem;background:#fff;color:#075985;font:600 14px/1.5 system-ui,sans-serif;text-decoration:none;">← ${label}</a>\n</nav>\n`;
}

export const englishNavigation = englishNavigationForPath();

/** @param {string} html @param {string} [path] */
export function addEnglishNavigation(html, path = '') {
  const navigation = englishNavigationForPath(path);
  // A copied or moved built lesson must return to its new grade, not the old one.
  const generated = /\n?<nav data-english-navigation="auto"[\s\S]*?<\/nav>\n?/;
  if (generated.test(html)) return html.replace(generated, navigation);
  // Preserve an author's existing return link and avoid duplicates on repeat builds.
  const markup = html.replace(/<!--[\s\S]*?-->|<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  const target = getEnglishReturnTarget(path).url.replace(/\/$/, '');
  const existing = new RegExp(`<a\\b[^>]*\\bhref\\s*=\\s*(?:"${target}/?"|'${target}/?'|${target}/?(?=[\\s>]))`, 'i');
  if (existing.test(markup)) return html;
  const body = /<body\b(?:[^>"']|"[^"]*"|'[^']*')*>/i;
  return body.test(html)
    ? html.replace(body, (opening) => opening + navigation)
    : navigation + html;
}

/** @returns {import('astro').AstroIntegration} */
export default function englishNavigationIntegration() {
  return {
    name: 'english-navigation',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const directory = join(fileURLToPath(dir), 'english');
        let updated = 0;
        async function visit(folder, prefix = '') {
          for (const file of await readdir(folder, { withFileTypes: true })) {
            const path = join(folder, file.name);
            const relative = prefix + file.name;
            if (file.isDirectory()) {
              await visit(path, `${relative}/`);
            } else if (file.isFile() && /\.html?$/i.test(file.name)
              && (!/^index\.html?$/i.test(file.name) || ENGLISH_WORKBOOKS.some(({ path }) => path === relative))) {
              const html = await readFile(path, 'utf8');
              const result = addEnglishNavigation(html, relative);
              if (result !== html) {
                await writeFile(path, result, 'utf8');
                updated++;
              }
            }
          }
        }
        try {
          await visit(directory);
        } catch (error) {
          if (error.code !== 'ENOENT' || error.path !== directory) throw error;
        }
        logger.info(`Added return navigation to ${updated} English pages.`);
      },
    },
  };
}
