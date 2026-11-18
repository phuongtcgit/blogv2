import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanEnglishTitle, getEnglishLessons } from '../src/lib/english.ts';

test('English sources produce decoded titles, safe links and stable dates without reading the filesystem', () => {
  const files = {
    'Colors.html': '<title>Colors &amp; colours &#x1F308;</title>',
    '2026-11-17-animals.html': '<title>Animals</title>',
    '2026-11-18-school.html': '<title>School</title>',
    'Words & games.htm': '<!-- <title>Ignore</title> --><script>const x = "<title>Ignore</title>";</script><title> Words\n &lt;games&gt; </title>',
    '2026-02-30-invalid.html': '<title>Invalid date</title>',
    'empty-title.html': '<title> </title>',
    'index.html': '<title>Not a lesson</title>',
    'download.html:Zone.Identifier': 'metadata',
    'notes.txt': 'notes',
  };
  const sources = Object.fromEntries(Object.entries(files).map(([name, html]) => [`/public/english/${name}`, html]));
  const lessons = getEnglishLessons(sources);
  assert.equal(lessons.length, 6);
  assert.deepEqual(lessons.slice(0, 2).map(({ title, date }) => [title, date]), [
    ['School', '2026-11-18'], ['Animals', '2026-11-17'],
  ]);
  assert.equal(lessons.find(({ url }) => url.endsWith('Colors.html')).title, 'Colors & colours 🌈');
  assert.equal(lessons.find(({ title }) => title === 'Words <games>').url, '/english/Words%20%26%20games.htm');
  assert.equal(lessons.find(({ title }) => title === 'Invalid date').date, undefined);
  assert.ok(lessons.some(({ title }) => title === 'empty title'));
  assert.deepEqual(getEnglishLessons(Object.fromEntries(Object.entries(sources).reverse())), lessons);
});

test('an empty compile-time lesson collection produces a useful empty list', () => {
  assert.deepEqual(getEnglishLessons({}), []);
});

test('grade folders keep distinct URLs for repeated filenames, including nested units and encoded names', () => {
  const lessons = getEnglishLessons({
    '/public/english/lop-1/Colors.html': '<title>Colors one</title>',
    '/public/english/lop-3/Colors.html': '<title>Colors three</title>',
    '/public/english/lop-3/unit 2/Words & games.html': '<title>Games</title>',
    '/public/english/Common.html': '<title>Common</title>',
    '/public/english/lop-1/index.html': '<title>Archive</title>',
  });
  assert.equal(lessons.length, 4);
  assert.equal(lessons.find(({ title }) => title === 'Colors one').url, '/english/lop-1/Colors.html');
  assert.equal(lessons.find(({ title }) => title === 'Colors one').grade, 'lop-1');
  assert.equal(lessons.find(({ title }) => title === 'Colors three').grade, 'lop-3');
  assert.equal(lessons.find(({ title }) => title === 'Games').url, '/english/lop-3/unit%202/Words%20%26%20games.html');
  assert.equal(lessons.find(({ title }) => title === 'Games').grade, 'lop-3');
  assert.equal(lessons.find(({ title }) => title === 'Common').grade, undefined);
});

test('numbered units follow natural order instead of placing Unit 10 before Unit 2', () => {
  const sources = Object.fromEntries([16, 2, 10, 1].map((unit) => [
    `/public/english/lop-1/g1_u${unit}.html`, `<title>Lớp 1 • Unit ${unit}: Lesson</title>`,
  ]));
  const lessons = getEnglishLessons(sources);
  assert.deepEqual(lessons.map(({ title }) => Number(title.match(/Unit (\d+)/)[1])), [1, 2, 10, 16]);
});

test('display titles drop the bilingual suffix after decoding HTML entities and Unicode', () => {
  for (const separator of [' - ', ' – ', ' — ', ' | ', ' • ', ': ', ' ']) {
    for (const suffix of ['Tiếng Anh Mỹ & Tiếng Việt', 'Tiếng Anh Mỹ &amp; Tiếng Việt', 'Tiếng Anh Mỹ và Tiếng Việt']) {
      assert.equal(cleanEnglishTitle(`Colors${separator}${suffix}`), 'Colors');
      assert.equal(cleanEnglishTitle(`Colors${separator}${suffix}`.normalize('NFD')), 'Colors');
    }
  }
  const unchanged = 'Tiếng Anh Mỹ & Tiếng Việt - Bài hát';
  assert.equal(cleanEnglishTitle(unchanged), unchanged, 'Only remove a trailing suffix');
  const lessons = getEnglishLessons({
    '/public/english/lop-1/Colors.html': '<title>Colors - Tiếng Anh Mỹ &amp; Tiếng Việt</title>',
    '/public/english/lop-1/bai-tap/index.html': '<title>Workbook one</title>',
    '/public/english/lop-3/bai-tap/index.html': '<title>Workbook three</title>',
  });
  assert.equal(lessons.length, 1, 'Workbooks must not inflate lesson counts');
  assert.equal(lessons[0].title, 'Colors');
});
