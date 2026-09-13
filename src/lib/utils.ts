import { SITE } from '../site.config';

// Định dạng ngày theo tiếng Việt: "12 tháng 9, 2026"
const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

export function formatDate(date: Date): string {
  return dateFormatter.format(date);
}

export function postUrl(slug: string): string {
  return `/blog/${slug}/`;
}

export function absoluteUrl(path: string): string {
  return new URL(path, SITE.url).toString();
}
