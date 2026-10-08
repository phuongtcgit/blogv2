import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTagIndex, normalizeTagLabel, normalizeTagSearch, tagSlug, tagUrl } from '../src/lib/tags.ts';

const post = (id, tags = [], { draft = false, date = '2026-01-01' } = {}) => ({
  id, data: { tags, draft, pubDate: new Date(date) },
});

test('case, Unicode and whitespace variants share one category and one vote per article', () => {
  const index = buildTagIndex([
    post('b', ['server', ' server ', 'Server', '', ' \t\n']),
    post('a', [' Server']),
    post('c', ['Bất  động sản', 'Bất động sản'.normalize('NFD')]),
  ]);
  assert.deepEqual(index.tags.map(({label, slug, count}) => ({label, slug, count})), [
    {label:'Server',slug:'server',count:2},
    {label:'Bất động sản',slug:'bat-dong-san',count:1},
  ]);
  assert.deepEqual(index.tagsByPostId.get('b').map(t => t.slug), ['server']);
  assert.equal(index.tagsByPostId.get('c').length, 1);
});

test('drafts are absent from posts, counts, membership and generated tags', () => {
  const index=buildTagIndex([
    post('public', ['server']),
    post('draft', ['server', 'draft-only', '💥'], {draft:true,date:'2027-01-01'}),
  ]);
  assert.deepEqual(index.posts.map(p=>p.id), ['public']);
  assert.deepEqual(index.tags.map(t=>[t.slug,t.count]), [['server',1]]);
  assert.equal(index.tagsByPostId.has('draft'), false);
});

test('empty collections, missing tags and blanks generate no routes', () => {
  assert.deepEqual(buildTagIndex([]).tags, []);
  const index=buildTagIndex([post('empty'),post('blank',['',' \t\n','\u00a0'])]);
  assert.deepEqual(index.tags, []);
  assert.deepEqual(index.tagsByPostId.get('blank'), []);
});

test('Vietnamese slugs and accent-insensitive filtering share one normalization', () => {
  assert.equal(tagSlug('Bất động sản'), 'bat-dong-san');
  assert.equal(tagSlug('Thông báo'), 'thong-bao');
  assert.equal(tagSlug('Đời sống'), 'doi-song');
  assert.equal(tagSlug(' -- Hello / world! -- '), 'hello-world');
  assert.equal(tagUrl(tagSlug('Thông báo')), '/tags/thong-bao/');
  assert.equal(normalizeTagLabel(' Bất\tđộng\n sản '), 'Bất động sản');
  assert.equal(normalizeTagSearch(' BẤT  ĐỘNG SẢN '), 'bat dong san');
  assert.ok(normalizeTagSearch('Bất động sản').includes(normalizeTagSearch(' bat   dong san ')));
  assert.equal(normalizeTagSearch('Server'), normalizeTagSearch(' server '));
});

test('post date ties, labels and counts are stable across input/tag permutations', () => {
  const input=[post('z',['server','Other']),post('a',['SERVER','other']),post('new',['server'],{date:'2026-02-01'})];
  const summarize = input => {
    const {posts,tags,tagsByPostId}=buildTagIndex(input);
    return {posts:posts.map(p=>p.id),tags:tags.map(t=>[t.label,t.slug,t.count,t.posts.map(p=>p.id)]),links:[...tagsByPostId].map(([id,t])=>[id,t.map(x=>x.slug)])};
  };
  assert.deepEqual(summarize(input),summarize([...input].reverse().map(p=>({...p,data:{...p.data,tags:[...p.data.tags].reverse()}}))));
  assert.deepEqual(buildTagIndex(input).posts.map(p=>p.id), ['new','a','z']);
  assert.deepEqual(buildTagIndex(input).tags[0].posts.map(p=>p.id), ['new','a','z']);
  assert.equal(buildTagIndex(input).tags[0].label,'SERVER');
  assert.deepEqual(buildTagIndex([post('x',['Zulu','alpha'])]).tags.map(t=>t.slug),['alpha','zulu']);
});

test('distinct labels with a shared slug fail with the labels and offending post IDs', () => {
  assert.throws(()=>buildTagIndex([post('cpp',['C++']),post('sharp',['C#'])]), error => {
    assert.match(error.message,/Tag slug collision for "c"/);
    for (const text of ['C++','C#','cpp','sharp']) assert.ok(error.message.includes(text));
    return true;
  });
  assert.throws(()=>buildTagIndex([post('accent',['Thông báo']),post('ascii',['Thong bao'])]),/Tag slug collision for "thong-bao"/);
  assert.throws(()=>buildTagIndex([post('one',['C#','C++'])]),/Tag slug collision/);
});

test('nonblank tags without a safe slug fail and identify their source', () => {
  for (const label of ['💥','###','東京']) {
    assert.throws(()=>buildTagIndex([post('invalid-source',[label])]), error => {
      assert.match(error.message,/cannot produce a safe ASCII slug/);
      assert.ok(error.message.includes(label));
      assert.ok(error.message.includes('invalid-source'));
      return true;
    });
  }
});

test('membership counts distinct IDs and normalization does not mutate frontmatter', () => {
  const source=post('one',[' Server ','server']);
  const before=structuredClone(source);
  const index=buildTagIndex([source,source]);
  assert.equal(index.tags[0].count,1);
  assert.deepEqual(source,before);
});

test('untrusted tag text remains data while its generated route uses only safe characters', () => {
  const label='<img src=x onerror="alert(1)">';
  const tag=buildTagIndex([post('untrusted',[label])]).tags[0];
  assert.equal(tag.label,label);
  assert.match(tag.slug,/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert.equal(tagUrl(tag.slug),'/tags/img-src-x-onerror-alert-1/');
});
