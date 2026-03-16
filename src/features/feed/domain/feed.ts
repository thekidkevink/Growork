export type FeedItemType = 'job' | 'news' | 'company_post';
export type FeedFilter = 'all' | 'jobs' | 'news';

export interface FeedCompanySummary {
  id?: string | null;
  name: string;
  logoUrl?: string | null;
}

export interface FeedItem {
  id: string;
  type: FeedItemType;
  title: string | null;
  body: string | null;
  imageUrl: string | null;
  industry: string | null;
  createdAt: string;
  company?: FeedCompanySummary | null;
  bookmarkCount?: number;
  commentCount?: number;
  likeCount?: number;
}

export interface FeedQuery {
  filter: FeedFilter;
  industry?: string | null;
  cursor?: string | null;
  pageSize: number;
}

export interface FeedPage {
  items: FeedItem[];
  nextCursor: string | null;
}
