import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { getEnglishLessons } from '../src/lib/english.ts';

test('English lessons are discovered from HTML, with decoded titles, safe links and stable dates', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'blogv2-english-'));
  try {
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
    for (const [name, content] of Object.entries(files)) await writeFile(join(dir, name), content);
    await mkdir(join(dir, 'images'));
    const lessons = await getEnglishLessons(dir);
    assert.equal(lessons.length, 6);
    assert.deepEqual(lessons.slice(0, 2).map(({ title, date }) => [title, date]), [
      ['School', '2026-11-18'], ['Animals', '2026-11-17'],
    ]);
    assert.equal(lessons.find(({ url }) => url.endsWith('Colors.html')).title, 'Colors & colours 🌈');
    assert.equal(lessons.find(({ title }) => title === 'Words <games>').url, '/english/Words%20%26%20games.htm');
    assert.equal(lessons.find(({ title }) => title === 'Invalid date').date, undefined);
    assert.ok(lessons.some(({ title }) => title === 'empty title'));
    assert.deepEqual(await getEnglishLessons(dir), lessons);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('an empty or missing English directory produces a useful empty list', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'blogv2-english-empty-'));
  try {
    assert.deepEqual(await getEnglishLessons(dir), []);
    assert.deepEqual(await getEnglishLessons(join(dir, 'missing')), []);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
