import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';

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

function build() {
  const result = spawnSync(process.execPath, [astroCli, 'build', '--config', './fixture.config.mjs'], {
    cwd: root,
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
  const valid = build();
  assert.equal(valid.status, 0, valid.output);
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
  const empty = build();
  assert.equal(empty.status, 0, empty.output);
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
