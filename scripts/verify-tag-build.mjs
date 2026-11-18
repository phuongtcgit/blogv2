import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { addEnglishNavigation } from '../src/integrations/english-navigation.mjs';
import { ENGLISH_WORKBOOKS } from '../src/lib/english-workbooks.ts';

// Exercise real Astro builds without editing the author's content or dist/.
const source = process.cwd();
// Use the package's declared CLI entrypoint instead of Astro's internal file layout.
const require = createRequire(import.meta.url);
const astroPackagePath = require.resolve('astro/package.json');
const astroPackage = JSON.parse(readFileSync(astroPackagePath, 'utf8'));
const astroCli = resolve(dirname(astroPackagePath), astroPackage.bin.astro);
const temp = mkdtempSync(join(tmpdir(), 'blogv2-tag-build-'));
const root = join(temp, 'project');
const keep = process.argv.includes('--keep');
mkdirSync(root);
for (const file of ['src', 'public', 'astro.config.mjs', 'tsconfig.json', 'package.json']) {
  cpSync(join(source, file), join(root, file), { recursive: true });
}
symlinkSync(join(source, 'node_modules'), join(root, 'node_modules'), 'dir');
// The shared dependency symlink must not share Astro's content cache with the
// real project or other fixture builds running at the same time.
writeFileSync(join(root, 'fixture.config.mjs'),
  "import config from './astro.config.mjs';\nexport default { ...config, cacheDir: './.astro-cache/' };\n");
const content = join(root, 'src/content/posts');
const dist = join(root, 'dist');

function resetPosts() {
  rmSync(content, { recursive: true, force: true });
  mkdirSync(content);
}

function writePost(id, tags, { date = '2026-01-03', draft = false, extension = 'md', body } = {}) {
  body ??= extension === 'mdx' ? '<strong>MDX_BODY</strong>' : `Published body for ${id}.`;
  writeFileSync(join(content, `${id}.${extension}`), `---\ntitle: ${JSON.stringify(id)}\ndescription: "Fixture for tag navigation"\npubDate: ${date}\ntags: ${JSON.stringify(tags)}\ndraft: ${draft}\n---\n\n${draft ? 'SECRET_DRAFT_BODY' : body}\n`);
}

function build({ callerDir = root } = {}) {
  const result = spawnSync(process.execPath, [astroCli, 'build', '--root', root, '--config', './fixture.config.mjs'], {
    cwd: callerDir,
    env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
    encoding: 'utf8',
    maxBuffer: 8 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  return { status: result.status, output: result.stdout + result.stderr };
}

function htmlFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? htmlFiles(path) : entry.name.endsWith('.html') ? [path] : [];
  });
}

try {
  const english = join(root, 'public/english');
  mkdirSync(english, { recursive: true });
  const lesson = '<!doctype html><html lang="en"><head><title>Words &amp; &lt;games&gt; - Tiếng Anh Mỹ &amp; Tiếng Việt</title></head><body><p>LESSON_BODY</p></body></html>';
  writeFileSync(join(english, '2026-11-17-words & games.html'), lesson);
  writeFileSync(join(english, 'notes.txt'), 'Not a lesson');
  for (const grade of ['lop-1', 'lop-3']) {
    mkdirSync(join(english, grade, 'unit 1'), { recursive: true });
    writeFileSync(join(english, grade, 'unit 1/same.html'), lesson.replace('Words &amp; &lt;games&gt;', `Fixture ${grade}`));
    mkdirSync(join(english, grade, 'tang-cuong'), { recursive: true });
    writeFileSync(join(english, grade, 'tang-cuong/l1_99_fixture.html'), `<html><head><title>Generic reinforcement app</title></head><body><h1>Extra ${grade} &amp; review</h1></body></html>`);
  }
  resetPosts();
  writePost('alpha', ['Server', 'server ', ' SERVER ', 'Bất động sản', '<img src=x onerror="alert(1)">'], {
    date: '2026-01-02',
    body: "Published body for alpha.\n\n## Cài đặt\n### Docker & Compose\n#### Kiểm tra\n## Cài đặt\n\n```bash\nprintf 'xin chào'\n\tdocker compose up -d\n```\n",
  });
  writePost('beta', [' server ', 'Thông báo', 'Đời sống'], {
    extension: 'mdx',
    body: '<strong>MDX_BODY</strong>\n\n## MDX heading\n### Nested heading\n\n```js\nconst value = "<&>";\n```\n',
  });
  writePost('gamma', ['server'], { body: '## Just one heading\n\nShort article.' });
  writePost('blank', ['', ' ', '\t']);
  writePost('no-tags', []);
  const longTag = 'x'.repeat(120);
  writePost('long-tag', [longTag]);
  writePost('draft', ['server', 'draft-only', 'C++', '💥'], { draft: true, date: '2027-01-01' });
  // Deployment runners need not launch Astro from the project root. The
  // previous English loader silently returned [] in this situation.
  const runner = join(root, 'build-runner');
  mkdirSync(runner);
  const valid = build({ callerDir: runner });
  assert.equal(valid.status, 0, valid.output);
  const englishIndex = readFileSync(join(dist, 'english/index.html'), 'utf8');
  assert.ok(englishIndex.includes('Words &amp; &lt;games&gt;'), 'Decode and safely escape the lesson title');
  assert.ok(!englishIndex.includes('notes.txt'), 'Only list HTML lessons');
  assert.ok(englishIndex.includes('aria-current="page"'), 'Highlight the English navigation');
  const workbookHub = readFileSync(join(dist, 'english/bai-tap/index.html'), 'utf8');
  assert.ok(!workbookHub.includes('data-english-navigation="auto"'), 'Workbook hub uses the blog navigation');
  assert.match(workbookHub, /href="\/english\/bai-tap\/" aria-current="page"/);
  for (const workbook of ENGLISH_WORKBOOKS) {
    assert.ok(workbookHub.includes(`href="${workbook.url}"`), 'Workbook missing from the exercise menu');
    assert.ok(!englishIndex.includes(`class="post-link" href="${workbook.url}"`), 'Do not list workbooks as lessons');
    const archive = readFileSync(join(dist, `english/${workbook.grade}/index.html`), 'utf8');
    assert.ok(archive.includes(`href="${workbook.url}"`), 'Grade page must link directly to its workbook');
    const original = readFileSync(join(root, 'public/english', workbook.path), 'utf8');
    const built = readFileSync(join(dist, 'english', workbook.path), 'utf8');
    assert.equal(built, addEnglishNavigation(original, workbook.path), 'Keep exercise content and scripts while adding navigation');
    assert.ok(built.includes(`href="/english/${workbook.grade}/"`));
    assert.equal(addEnglishNavigation(built, workbook.path), built, 'No duplicate workbook return buttons');
  }
  for (const [, title] of englishIndex.matchAll(/class="post-link" href="[^"]+">([^<]*)<\/a>/g)) {
    assert.ok(!title.includes('Tiếng Anh Mỹ'), `Untrimmed display title: ${title}`);
  }
  assert.ok(!/class="post-link" href="[^"]+\/tang-cuong\//.test(englishIndex), 'Do not inflate lesson counts with reinforcement pages');
  const reinforcementHub = readFileSync(join(dist, 'english/tang-cuong/index.html'), 'utf8');
  assert.match(reinforcementHub, /href="\/english\/tang-cuong\/" aria-current="page"/);
  for (const grade of ['lop-1', 'lop-3']) {
    const route = `/english/${grade}/tang-cuong/`;
    assert.ok(reinforcementHub.includes(`href="${route}"`));
    assert.ok(workbookHub.includes(`href="${route}"`), 'Exercise menu links to reinforcement lists');
    const archive = readFileSync(join(dist, `english/${grade}/tang-cuong/index.html`), 'utf8');
    assert.ok(!archive.includes('data-english-navigation="auto"'), 'Reinforcement index uses the blog layout');
    assert.ok(archive.includes(`Extra ${grade} &amp; review`), 'Use specific H1 titles instead of identical app titles');
    const links = [...archive.matchAll(/class="post-link" href="([^"]+)"/g)].map((m) => m[1]);
    assert.ok(links.length > 0 && links.every((href) => href.startsWith(route)), 'Reinforcement membership stays within its grade');
    for (const href of links) {
      const relative = decodeURIComponent(href).replace(/^\/english\//, '');
      const original = readFileSync(join(root, 'public/english', relative), 'utf8');
      const built = readFileSync(join(dist, 'english', relative), 'utf8');
      assert.equal(built, addEnglishNavigation(original, relative));
      assert.ok(built.includes(`href="${route}"`), 'Return to the reinforcement list');
      assert.equal(addEnglishNavigation(built, relative), built);
    }
    const gradeArchive = readFileSync(join(dist, `english/${grade}/index.html`), 'utf8');
    assert.ok(gradeArchive.includes(`href="${route}"`), 'Grade pages link directly to extra practice');
    assert.ok(!/class="post-link" href="[^"]+\/tang-cuong\//.test(gradeArchive), 'Keep extra practice out of ordinary lesson lists');
  }
  for (const [, href] of englishIndex.matchAll(/class="post-link" href="([^"]+)"/g)) {
    const output = join(dist, decodeURIComponent(href));
    assert.ok(existsSync(output), `Broken English lesson link: ${href}`);
    const original = readFileSync(join(root, 'public', decodeURIComponent(href)), 'utf8');
    const built = readFileSync(output, 'utf8');
    const lessonPath = decodeURIComponent(href).replace(/^\/english\//, '');
    assert.equal(built, addEnglishNavigation(original, lessonPath), `Automatic return navigation missing or lesson HTML changed: ${href}`);
    assert.equal(addEnglishNavigation(built, lessonPath), built, `Duplicate return links: ${href}`);
  }
  for (const grade of ['lop-1', 'lop-3']) {
    const archive = readFileSync(join(dist, `english/${grade}/index.html`), 'utf8');
    const members = [...archive.matchAll(/class="post-link" href="([^"]+)"/g)].map((m) => m[1]);
    assert.ok(members.includes(`/english/${grade}/unit%201/same.html`), 'Discover nested lessons and preserve repeated filenames');
    assert.ok(members.every((href) => href.startsWith(`/english/${grade}/`)), `Wrong grade membership in ${grade}`);
    const nested = readFileSync(join(dist, `english/${grade}/unit 1/same.html`), 'utf8');
    assert.ok(nested.includes(`href="/english/${grade}/"`), 'Return to the correct grade');
    assert.match(archive, new RegExp(`href="/english/${grade}/" aria-current="page"`));
    assert.ok(!archive.includes('data-english-navigation="auto"'), 'Do not inject lesson buttons into archive pages');
  }
  const redirects = readFileSync(join(dist, '_redirects'), 'utf8');
  for (const line of redirects.split('\n').filter((line) => line && !line.startsWith('#'))) {
    const [from, to, code] = line.trim().split(/\s+/);
    assert.equal(code, '301');
    assert.notEqual(from, to);
    assert.ok(existsSync(join(dist, `${to}.html`)), `Broken legacy redirect: ${from} -> ${to}`);
  }
  assert.equal(readFileSync(join(dist, 'english/2026-11-17-words & games.html'), 'utf8'), addEnglishNavigation(lesson), 'Add navigation while preserving the standalone lesson');
  console.log('PASS English library: recursive grade discovery, repeated filenames, correct return links, legacy redirects and preserved lesson content');
  const server = readFileSync(join(dist, 'tags/server/index.html'), 'utf8');
  const links = [...server.matchAll(/class="post-link" href="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(links, ['/blog/beta/', '/blog/gamma/', '/blog/alpha/']);
  const index = readFileSync(join(dist, 'tags/index.html'), 'utf8');
  const counted = index.match(/<a\b[^>]*href="\/tags\/server\/"[^>]*>[\s\S]*?<\/a>/)?.[0];
  assert.ok(counted);
  assert.match(counted, /class="tag-count">3/);
  assert.ok(index.includes('&lt;img'));
  // '<' is legal inside a quoted HTML attribute; it does not open an element.
  const markup = index.replace(/"[^"]*"/g, '""');
  assert.ok(!/<[^>]+\bonerror=/.test(markup));
  const routes = ['server', 'bat-dong-san', 'thong-bao', 'doi-song', 'img-src-x-onerror-alert-1', longTag];
  assert.deepEqual(readdirSync(join(dist, 'tags')).filter((name) => name !== 'index.html').sort(), [...routes].sort());
  for (const file of htmlFiles(dist)) {
    const html = readFileSync(file, 'utf8');
    assert.ok(!html.includes('SECRET_DRAFT_BODY') && !html.includes('draft-only'), file);
    // Standalone public HTML lessons are copied untouched, without blog meta.
    if (!existsSync(join(root, 'public', relative(dist, file)))) {
      for (const attribute of ['name="description"', 'property="og:description"', 'name="twitter:description"']) {
        assert.match(html, new RegExp(`<meta ${attribute} content="[^"]+"`), `Missing page description in ${file}`);
      }
    }
    for (const [, href] of html.matchAll(/href="(\/tags\/[^"?#]*)"/g)) {
      assert.ok(existsSync(join(dist, href, 'index.html')), `Broken tag link ${href} in ${file}`);
    }
  }
  const rss = readFileSync(join(dist, 'rss.xml'), 'utf8');
  assert.ok(rss.includes('MDX_BODY') && rss.includes('Published body for alpha.'));
  assert.ok(!rss.includes('SECRET_DRAFT_BODY'));
  assert.ok(!existsSync(join(dist, 'blog/draft/index.html')));
  assert.ok(!existsSync(join(dist, 'tags/draft-only/index.html')));
  const alpha = readFileSync(join(dist, 'blog/alpha/index.html'), 'utf8');
  const beta = readFileSync(join(dist, 'blog/beta/index.html'), 'utf8');
  assert.ok(alpha.includes('<meta name="description" content="Fixture for tag navigation"'), 'Keep the article-specific description');
  for (const [html, expectedCount] of [[alpha, 4], [beta, 2]]) {
    const toc = html.match(/<nav class="article-toc"[\s\S]*?<\/nav>/)?.[0];
    assert.ok(toc, 'Static TOC missing from Markdown/MDX');
    const anchors = [...toc.matchAll(/href="#([^"]+)"/g)].map((m) => decodeURIComponent(m[1]));
    assert.equal(anchors.length, expectedCount);
    assert.equal(new Set(anchors).size, expectedCount, 'Repeated headings must use distinct anchors');
    for (const id of anchors) assert.ok(html.includes(`id="${id}"`), `Broken TOC anchor ${id}`);
    assert.ok(html.indexOf('class="article-toc"') < html.indexOf('class="prose"'));
  }
  const related = alpha.match(/<section class="related-posts"[\s\S]*?<\/section>/)?.[0];
  assert.ok(related);
  assert.deepEqual([...related.matchAll(/class="post-link" href="([^"]+)"/g)].map((m) => m[1]), ['/blog/beta/', '/blog/gamma/']);
  for (const id of ['gamma', 'blank', 'no-tags', 'long-tag']) {
    const html = readFileSync(join(dist, `blog/${id}/index.html`), 'utf8');
    assert.ok(!html.includes('class="article-toc"'), `Unnecessary TOC for ${id}`);
    if (id !== 'gamma') assert.ok(!html.includes('class="related-posts"'), `Unrelated recommendations for ${id}`);
  }
  assert.ok(!rss.includes('class="article-toc"') && !rss.includes('class="related-posts"') && !rss.includes('class="code-copy"'));
  console.log('PASS article features: Markdown/MDX TOC anchors, duplicate headings, related links, short/untagged articles and clean RSS');
  cpSync(dist, join(temp, 'positive-dist'), { recursive: true });
  console.log('PASS fixture build: .md/.mdx, distinct counts, date ties, drafts, blank tags, escaped HTML and all tag links');

  resetPosts();
  writePost('empty', []);
  writePost('blank', ['', ' \t ']);
  for (const file of htmlFiles(join(english, 'lop-1'))) {
    if (file !== join(english, 'lop-1/bai-tap/index.html')) rmSync(file);
  }
  const empty = build();
  assert.equal(empty.status, 0, empty.output);
  const emptyGrade = readFileSync(join(dist, 'english/lop-1/index.html'), 'utf8');
  assert.ok(emptyGrade.includes('Bài học lớp 1 sẽ sớm được cập nhật.'));
  assert.ok(!emptyGrade.includes('class="post-link"'), 'Empty grade does not show lessons from another grade');
  assert.ok(emptyGrade.includes('href="/english/lop-1/bai-tap/"'), 'Workbooks stay available even if a grade has no lessons');
  const emptyReinforcement = readFileSync(join(dist, 'english/lop-1/tang-cuong/index.html'), 'utf8');
  assert.ok(emptyReinforcement.includes('Bài tập tăng cường lớp 1 sẽ sớm được cập nhật.'));
  assert.ok(!emptyReinforcement.includes('class="post-link"'), 'Removed reinforcement files do not leave stale links');
  assert.deepEqual(readdirSync(join(dist, 'tags')), ['index.html']);
  assert.ok(readFileSync(join(dist, 'tags/index.html'), 'utf8').includes('Chưa có chủ đề nào.'));
  assert.ok(readFileSync(join(dist, 'index.html'), 'utf8').includes('Chưa có chủ đề nào.'));
  cpSync(dist, join(temp, 'empty-dist'), { recursive: true });
  console.log('PASS empty-tag build: no false archive routes and useful empty states');

  resetPosts();
  writePost('sharp', ['C#']);
  writePost('cpp', ['C++']);
  const collision = build();
  assert.notEqual(collision.status, 0);
  assert.match(collision.output, /Tag slug collision for "c"/);
  for (const text of ['C#', 'C++', 'sharp', 'cpp']) assert.ok(collision.output.includes(text));
  console.log('PASS expected build rejection: colliding tags identify both labels and posts');

  resetPosts();
  writePost('invalid-source', ['💥']);
  const invalid = build();
  assert.notEqual(invalid.status, 0);
  assert.match(invalid.output, /cannot produce a safe ASCII slug/);
  assert.ok(invalid.output.includes('invalid-source'));
  console.log('PASS expected build rejection: nonblank tag without a safe slug');
} finally {
  if (keep) console.log(`Fixture artifacts retained: ${temp}`);
  else rmSync(temp, { recursive: true, force: true });
}
