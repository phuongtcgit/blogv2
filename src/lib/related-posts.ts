import type { Tag, TaggedPost } from './tags';

// Use the canonical tag memberships so drafts and tag spelling variants follow
// the same rules as the static topic archives.
export function getRelatedPosts<Post extends TaggedPost>(
  postId: string,
  tagsByPostId: ReadonlyMap<string, readonly Tag<Post>[]>
): Post[] {
  const candidates = new Map<string, { post: Post; sharedTags: number }>();
  for (const tag of tagsByPostId.get(postId) ?? []) {
    for (const post of tag.posts) {
      if (post.id === postId || post.data.draft) continue;
      const candidate = candidates.get(post.id) ?? { post, sharedTags: 0 };
      candidate.sharedTags++;
      candidates.set(post.id, candidate);
    }
  }

  return [...candidates.values()]
    .sort((a, b) =>
      b.sharedTags - a.sharedTags ||
      b.post.data.pubDate.valueOf() - a.post.data.pubDate.valueOf() ||
      (a.post.id < b.post.id ? -1 : a.post.id > b.post.id ? 1 : 0)
    )
    .slice(0, 3)
    .map(({ post }) => post);
}
