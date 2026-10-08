export interface TaggedPost {
  id: string;
  data: { tags: string[]; draft: boolean; pubDate: Date };
}

export interface Tag<Post extends TaggedPost = TaggedPost> {
  label: string;
  slug: string;
  count: number;
  posts: Post[];
}

// Code-point order is independent of filesystem order and machine locale.
const compareText = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

export function normalizeTagLabel(value: string): string {
  return value.normalize('NFC').trim().replace(/\s+/gu, ' ');
}

// Shared by slug generation and the browser's Vietnamese name filter.
export function normalizeTagSearch(value: string): string {
  return normalizeTagLabel(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/đ/g, 'd');
}

export function tagSlug(value: string): string {
  return normalizeTagSearch(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function tagUrl(slug: string): string {
  return `/tags/${slug}/`;
}

export function sortPostsNewestFirst<Post extends TaggedPost>(posts: Post[]): Post[] {
  return [...posts].sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf() || compareText(a.id, b.id)
  );
}

export function buildTagIndex<Post extends TaggedPost>(allPosts: Post[]) {
  const posts = sortPostsNewestFirst(allPosts.filter((post) => !post.data.draft));
  const groups = new Map<string, { labels: Set<string>; posts: Map<string, Post> }>();

  for (const post of posts) {
    for (const raw of post.data.tags) {
      const label = normalizeTagLabel(raw);
      if (!label) continue;
      if (!tagSlug(label)) {
        throw new Error(`Tag ${JSON.stringify(raw)} in post ${JSON.stringify(post.id)} cannot produce a safe ASCII slug.`);
      }
      // Identity keeps accents/punctuation; only casing and whitespace merge.
      const identity = label.toLowerCase();
      const group = groups.get(identity) ?? { labels: new Set<string>(), posts: new Map<string, Post>() };
      group.labels.add(label);
      // A post contributes once even if its frontmatter repeats the same tag.
      group.posts.set(post.id, post);
      groups.set(identity, group);
    }
  }

  const routes = new Map<string, { identity: string; labels: string[]; postIds: string[] }>();
  const tags: Tag<Post>[] = [];
  for (const [identity, group] of [...groups].sort(([a], [b]) => compareText(a, b))) {
    const labels = [...group.labels].sort(compareText);
    const label = labels[0];
    const slug = tagSlug(label);
    const postIds = [...group.posts.keys()].sort(compareText);
    const existing = routes.get(slug);
    // Never silently combine distinct topics such as C# and C++, or accented
    // and unaccented labels that happen to produce the same ASCII URL.
    if (existing && existing.identity !== identity) {
      throw new Error(
        `Tag slug collision for ${JSON.stringify(slug)}: ${JSON.stringify(existing.labels)} in posts ${JSON.stringify(existing.postIds)} conflicts with ${JSON.stringify(labels)} in posts ${JSON.stringify(postIds)}. Choose distinct tag labels.`
      );
    }
    routes.set(slug, { identity, labels, postIds });
    const members = sortPostsNewestFirst([...group.posts.values()]);
    tags.push({ label, slug, count: members.length, posts: members });
  }

  tags.sort((a, b) => b.count - a.count || compareText(a.label.toLowerCase(), b.label.toLowerCase()));
  const tagsByPostId = new Map(posts.map((post) => [post.id, [] as Tag<Post>[]]));
  for (const tag of tags) {
    for (const post of tag.posts) tagsByPostId.get(post.id)!.push(tag);
  }
  return { posts, tags, tagsByPostId };
}
