import { getEnglishGrade, isEnglishReinforcementPath, type EnglishGrade } from './english-grades.ts';

export interface EnglishLesson {
  title: string;
  url: string;
  date?: string;
  grade?: EnglishGrade;
  order?: number;
}

const lessonTitleOrder = new Intl.Collator('vi', { numeric: true });

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

export function cleanEnglishTitle(value: string): string {
  return decodeTitle(value).normalize('NFC')
    .replace(/\s*(?:[-–—|•:]\s*)?Tiếng Anh Mỹ\s*(?:&|và)\s*Tiếng Việt\s*$/iu, '')
    .trim();
}

// Vite supplies the HTML at compile time, before deployment. Rendering the
// library never needs access to the source tree or a particular working directory.
function readEnglishCatalog(sources: Record<string, string>, reinforcement: boolean): EnglishLesson[] {
  const lessons = Object.entries(sources)
    .filter(([path]) => /\.html?$/i.test(path) && !/^index\.html?$/i.test(path.split('/').at(-1)!))
    .filter(([path]) => isEnglishReinforcementPath(path) === reinforcement)
    .map(([path, html]) => {
      const relative = path.replace(/^\/public\/english\//, '');
      const name = relative.split('/').at(-1)!;
      const source = html.replace(/<!--[\s\S]*?-->/g, '').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
      const heading = reinforcement
        ? source.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]*>/g, '')
        : undefined;
      const title = cleanEnglishTitle(heading || source.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '')
        || name.replace(/\.html?$/i, '').replace(/[-_]+/g, ' ');
      const candidate = name.match(/^(\d{4}-\d{2}-\d{2})[-_]/)?.[1];
      const parsed = candidate ? new Date(`${candidate}T00:00:00Z`) : undefined;
      const date = parsed && !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === candidate
        ? candidate : undefined;
      const url = `/english/${relative.split('/').map(encodeURIComponent).join('/')}`;
      const number = reinforcement ? name.match(/^[lg]\d+_(?:u)?(\d+)_/i)?.[1] : undefined;
      const order = number === undefined ? undefined : Number(number);
      return { title, url, date, grade: getEnglishGrade(relative)?.slug, order };
    });

  // A filename date survives clones/deploys, unlike filesystem modification time.
  return lessons.sort((a, b) =>
    (b.date ?? '').localeCompare(a.date ?? '')
    || (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER)
    || lessonTitleOrder.compare(a.title, b.title) || a.url.localeCompare(b.url)
  );
}

export function getEnglishLessons(sources: Record<string, string>): EnglishLesson[] {
  return readEnglishCatalog(sources, false);
}

export function getEnglishReinforcements(sources: Record<string, string>): EnglishLesson[] {
  return readEnglishCatalog(sources, true);
}
