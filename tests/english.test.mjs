import test from 'node:test';
import assert from 'node:assert/strict';
import { getEnglishLessons } from '../src/lib/english.ts';

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
