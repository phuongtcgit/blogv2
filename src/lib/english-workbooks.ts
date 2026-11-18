import type { EnglishGrade } from './english-grades';

export interface EnglishWorkbook {
  grade: EnglishGrade;
  title: string;
  description: string;
  url: string;
  path: string;
}

export const ENGLISH_WORKBOOKS: EnglishWorkbook[] = [
  {
    grade: 'lop-1', title: 'Bài tập Tiếng Anh Lớp 1',
    description: 'Nghe và chọn, nhìn và nối từ, điền chữ cái.',
    url: '/english/lop-1/bai-tap/', path: 'lop-1/bai-tap/index.html',
  },
  {
    grade: 'lop-3', title: 'Bài tập Tiếng Anh Lớp 3',
    description: 'Điền từ, sắp xếp câu, đọc và chọn đáp án.',
    url: '/english/lop-3/bai-tap/', path: 'lop-3/bai-tap/index.html',
  },
];
