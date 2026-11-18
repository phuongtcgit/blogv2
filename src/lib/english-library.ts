import { getEnglishLessons, getEnglishReinforcements } from './english';

// Compile the entire library once; no source filesystem is needed after build.
const sources = import.meta.glob<string>(
  '/public/english/**/*.{html,htm,HTML,HTM}',
  { query: '?raw', import: 'default', eager: true }
);

export const englishLessons = getEnglishLessons(sources);
export const englishReinforcements = getEnglishReinforcements(sources);
