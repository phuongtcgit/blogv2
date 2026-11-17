import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export interface EnglishLesson {
  title: string;
  url: string;
  date?: string;
}

// Titles stay plain text; Astro escapes them when rendering links.
function decodeTitle(value: string): string {
  const named: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
  return value.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (entity, code: string) => {
    if (!code.startsWith('#')) return named[code.toLowerCase()] ?? entity;
    const point = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : Number(code.slice(1));
    return point > 0 && point <= 0x10ffff && !(point >= 0xd800 && point <= 0xdfff)
      ? String.fromCodePoint(point) : entity;
  }).replace(/\s+/g, ' ').trim();
}

// The caller must pass Astro's configured public directory. process.cwd() can
// differ from the project root in a deployment build.
export async function getEnglishLessons(directory: string): Promise<EnglishLesson[]> {
  let files;
  try {
    files = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }

  const lessons = await Promise.all(files
    .filter((file) => file.isFile() && /\.html?$/i.test(file.name) && !/^index\.html?$/i.test(file.name))
    .map(async ({ name }) => {
      const html = await readFile(resolve(directory, name), 'utf8');
      const source = html.replace(/<!--[\s\S]*?-->/g, '').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
      const title = decodeTitle(source.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '')
        || name.replace(/\.html?$/i, '').replace(/[-_]+/g, ' ');
      const candidate = name.match(/^(\d{4}-\d{2}-\d{2})[-_]/)?.[1];
      const parsed = candidate ? new Date(`${candidate}T00:00:00Z`) : undefined;
      const date = parsed && !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === candidate
        ? candidate : undefined;
      return { title, url: `/english/${encodeURIComponent(name)}`, date };
    }));

  // A filename date survives clones/deploys, unlike filesystem modification time.
  return lessons.sort((a, b) =>
    (b.date ?? '').localeCompare(a.date ?? '') || a.title.localeCompare(b.title, 'vi') || a.url.localeCompare(b.url)
  );
}
