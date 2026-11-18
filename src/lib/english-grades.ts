export const ENGLISH_GRADES = [
  { slug: 'lop-1', label: 'Lớp 1' },
  { slug: 'lop-3', label: 'Lớp 3' },
] as const;

export type EnglishGrade = (typeof ENGLISH_GRADES)[number]['slug'];

export function getEnglishGrade(path: string) {
  const folder = path.replaceAll('\\', '/').split('/')[0];
  return ENGLISH_GRADES.find(({ slug }) => slug === folder);
}

export function getEnglishReturnTarget(path = '') {
  const grade = getEnglishGrade(path);
  return grade
    ? { url: `/english/${grade.slug}/`, label: `Bài học English ${grade.label}` }
    : { url: '/english/', label: 'Tất cả bài học English' };
}
