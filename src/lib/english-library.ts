import { getEnglishLessons } from './english';

// Compile the entire library once; no source filesystem is needed after build.
export const englishLessons = getEnglishLessons(import.meta.glob<string>(
  '/public/english/**/*.{html,htm,HTML,HTM}',
  { query: '?raw', import: 'default', eager: true }
));
