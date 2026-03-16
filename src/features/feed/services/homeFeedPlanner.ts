import type {
  FeedFilter,
  FeedPage,
  FeedQuery,
} from '@/src/features/feed/domain/feed';

export const feedFilters: Array<{ id: FeedFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'jobs', label: 'Jobs' },
  { id: 'news', label: 'News' },
];

export function buildHomeFeedQuery(input?: Partial<FeedQuery>): FeedQuery {
  return {
    filter: input?.filter ?? 'all',
    industry: input?.industry ?? null,
    cursor: input?.cursor ?? null,
    pageSize: input?.pageSize ?? 10,
  };
}

export function createEmptyFeedPage(): FeedPage {
  return {
    items: [],
    nextCursor: null,
  };
}

export function mapFilterToLegacyTypes(filter: FeedFilter): string[] {
  switch (filter) {
    case 'jobs':
      return ['job'];
    case 'news':
      return ['news', 'article'];
    case 'all':
    default:
      return ['job', 'news', 'article', 'company_post'];
  }
}
