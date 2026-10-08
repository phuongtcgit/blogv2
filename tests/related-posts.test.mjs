import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTagIndex } from '../src/lib/tags.ts';
import { getRelatedPosts } from '../src/lib/related-posts.ts';

const post = (id, tags = [], { draft = false, date = '2026-01-01' } = {}) => ({
  id, data: { tags, draft, pubDate: new Date(date) },
});
const related = (posts, id) => getRelatedPosts(id, buildTagIndex(posts).tagsByPostId).map(p => p.id);

test('related posts prefer shared topics, then date and ID; at most three unique posts', () => {
  const posts = [
    post('current', ['Server', 'Docker']),
    post('both', ['server', 'docker'], { date: '2025-01-01' }),
    post('latest', ['docker'], { date: '2026-02-01' }),
    post('z', ['server']),
    post('a', ['server']),
    post('unrelated', ['Other'], { date: '2027-01-01' }),
  ];
  assert.deepEqual(related(posts, 'current'), ['both', 'latest', 'a']);
  assert.deepEqual(related([...posts].reverse(), 'current'), ['both', 'latest', 'a']);
});

test('related posts exclude self and drafts and count each canonical topic once', () => {
  const posts = [
    post('current', [' server ', 'SERVER', 'Bất động sản']),
    post('single', ['server', 'SERVER', ' server '], { date: '2027-01-01' }),
    post('two', ['server', 'Bất  động sản'.normalize('NFD')]),
    post('draft', ['server', 'Bất động sản'], { draft: true, date: '2028-01-01' }),
  ];
  assert.deepEqual(related(posts, 'current'), ['two', 'single']);
});

test('no recommendations for missing posts, missing topics or no shared topics', () => {
  const posts = [post('empty'), post('alone', ['Server']), post('other', ['Other'])];
  for (const id of ['missing', 'empty', 'alone', 'other']) assert.deepEqual(related(posts, id), []);
  assert.deepEqual(related([], 'missing'), []);
});
