import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const layout = readFileSync(new URL('../src/layouts/BaseLayout.astro', import.meta.url), 'utf8');
const scripts = [...layout.matchAll(/<script is:inline>([\s\S]*?)<\/script>/g)].map((match) => match[1]);

function loadTheme({ stored = null, blockRead = false, blockWrite = false } = {}) {
  const listeners = {};
  const attributes = {};
  const root = { dataset: {} };
  const button = {
    dataset: { state: 'auto' },
    addEventListener(event, listener) { listeners[event] = listener; },
    setAttribute(name, value) { attributes[name] = value; },
  };
  const context = {
    document: {
      documentElement: root,
      getElementById() { return button; },
    },
    localStorage: {
      getItem() {
        if (blockRead) throw new Error('Storage read blocked');
        return stored;
      },
      setItem(key, value) {
        if (blockWrite) throw new Error('Storage write blocked');
        stored = value;
      },
    },
  };
  for (const script of scripts) runInNewContext(script, context);
  return { root, button, attributes, click: () => listeners.click(), stored: () => stored };
}

test('theme restores the saved preference and accessible label, then cycles and saves', () => {
  const theme = loadTheme({ stored: 'dark' });
  assert.equal(theme.root.dataset.theme, 'dark');
  assert.equal(theme.button.dataset.state, 'dark');
  assert.equal(theme.attributes['aria-label'], 'Chế độ giao diện: Tối');
  for (const state of ['auto', 'light', 'dark']) {
    theme.click();
    assert.equal(theme.button.dataset.state, state);
    assert.equal(theme.root.dataset.theme, state === 'auto' ? undefined : state);
    assert.equal(theme.stored(), state);
  }
});

for (const options of [
  { blockRead: true, blockWrite: true },
  { stored: 'dark', blockWrite: true },
]) {
  test(`theme keeps cycling when storage is blocked: ${JSON.stringify(options)}`, () => {
    const theme = loadTheme(options);
    const expected = options.blockRead ? ['light', 'dark', 'auto'] : ['auto', 'light', 'dark'];
    for (const state of expected) {
      theme.click();
      assert.equal(theme.button.dataset.state, state);
      assert.equal(theme.root.dataset.theme, state === 'auto' ? undefined : state);
    }
  });
}

test('invalid or absent stored preference follows the system', () => {
  for (const stored of [null, '', 'unexpected']) {
    const theme = loadTheme({ stored });
    assert.equal(theme.root.dataset.theme, undefined);
    assert.equal(theme.button.dataset.state, 'auto');
    theme.click();
    assert.equal(theme.root.dataset.theme, 'light');
  }
});
