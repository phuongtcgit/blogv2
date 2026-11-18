export const ENGLISH_GRADES = [
  { slug: 'lop-1', label: 'Lớp 1' },
  { slug: 'lop-3', label: 'Lớp 3' },
] as const;

export type EnglishGrade = (typeof ENGLISH_GRADES)[number]['slug'];

export function getEnglishGrade(path: string) {
  const folder = path.replaceAll('\\', '/').split('/')[0];
  return ENGLISH_GRADES.find(({ slug }) => slug === folder);
}

export function isEnglishReinforcementPath(path: string): boolean {
  const relative = path.replaceAll('\\', '/').replace(/^\/public\/english\//, '');
  return Boolean(getEnglishGrade(relative)) && relative.split('/')[1] === 'tang-cuong';
}

export function getEnglishReturnTarget(path = '') {
  const grade = getEnglishGrade(path);
  if (grade && isEnglishReinforcementPath(path)) {
    return { url: `/english/${grade.slug}/tang-cuong/`, label: `Tăng cường English ${grade.label}` };
  }
  return grade
    ? { url: `/english/${grade.slug}/`, label: `Bài học English ${grade.label}` }
    : { url: '/english/', label: 'Tất cả bài học English' };
}
