import { getCollection } from 'astro:content';
import { buildTagIndex } from './tags';

// Rebuild from the same collection for every surface; no stale dev-time cache.
export async function getPostNavigation() {
  return buildTagIndex(await getCollection('posts'));
}
