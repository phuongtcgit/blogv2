import test from 'node:test';
import assert from 'node:assert/strict';
import { addEnglishNavigation, englishNavigation, englishNavigationForPath } from '../src/integrations/english-navigation.mjs';

test('standalone lessons gain a visible return link without changing their original HTML or scripts', () => {
  const html = '<!doctype html><html><head><title>New lesson</title></head><BODY class="x > y"><h1>New lesson</h1><script>const text = "Tiếng Việt";</script></BODY></html>';
  const result = addEnglishNavigation(html);
  assert.equal(result.replace(englishNavigation, ''), html);
  assert.ok(result.indexOf(englishNavigation) < result.indexOf('<h1>'));
  assert.match(result, /href="\/english\/"/);
  assert.equal(addEnglishNavigation(result), result);
});

test('an existing return link is preserved without creating a second button', () => {
  for (const href of ['"/english/"', "'/english'", '/english/']) {
    const html = `<body><nav><a href=${href}>Về danh sách</a></nav><main>Lesson</main></body>`;
    assert.equal(addEnglishNavigation(html), html);
  }
});

test('links in comments or script strings do not suppress real navigation; fragments are supported', () => {
  const html = '<body><!-- <a href="/english/">old</a> --><script>const example = \'<a href="/english/">\';</script><h1>Lesson</h1></body>';
  assert.ok(addEnglishNavigation(html).includes(englishNavigation));
  assert.equal(addEnglishNavigation('<h1>Lesson</h1>'), englishNavigation + '<h1>Lesson</h1>');
});

test('lessons return to their own grade, including nested lessons and copied built HTML', () => {
  const original = '<body><h1>Lesson</h1><script>const score = 1;</script></body>';
  for (const grade of ['lop-1', 'lop-3']) {
    const path = `${grade}/unit/Colors.html`;
    const built = addEnglishNavigation(original, path);
    assert.ok(built.includes(`href="/english/${grade}/"`));
    assert.equal(built.replace(englishNavigationForPath(path), ''), original);
    assert.equal(addEnglishNavigation(built, path), built);
  }
  const moved = addEnglishNavigation(addEnglishNavigation(original, 'lop-1/a.html'), 'lop-3/a.html');
  assert.equal((moved.match(/data-english-navigation="auto"/g) ?? []).length, 1);
  assert.ok(moved.includes('href="/english/lop-3/"'));
  assert.ok(!moved.includes('href="/english/lop-1/"'));
});
