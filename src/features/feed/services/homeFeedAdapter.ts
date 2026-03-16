import type {
  FeedItem,
  FeedItemType,
  FeedPage,
  FeedQuery,
} from "@/src/features/feed/domain/feed";
import { createEmptyFeedPage, mapFilterToLegacyTypes } from "@/src/features/feed/services/homeFeedPlanner";
import type { ExtendedContentCardProps } from "@/hooks/posts/usePostOperations";

export interface HomeFeedCard extends ExtendedContentCardProps {
  feedType: FeedItemType;
}

export function buildHomeFeedPage(
  cards: ExtendedContentCardProps[],
  query: FeedQuery
): FeedPage {
  const allowedTypes = new Set(mapFilterToLegacyTypes(query.filter));
  const normalizedIndustry = query.industry?.trim();

  const items = cards
    .map(toFeedItem)
    .filter((item) => {
      if (!allowedTypes.has(item.type)) {
        return false;
      }

      if (normalizedIndustry && item.industry !== normalizedIndustry) {
        return false;
      }

      return true;
    });

  if (!items.length) {
    return createEmptyFeedPage();
  }

  return {
    items,
    nextCursor: null,
  };
}

export function buildHomeFeedCards(
  cards: ExtendedContentCardProps[],
  query: FeedQuery
): HomeFeedCard[] {
  const allowedTypes = new Set(mapFilterToLegacyTypes(query.filter));
  const normalizedIndustry = query.industry?.trim();

  return cards
    .map((card) => ({
      ...card,
      feedType: mapCardVariantToFeedType(card.variant),
    }))
    .filter((card) => {
      if (!allowedTypes.has(card.feedType)) {
        return false;
      }

      if (normalizedIndustry && card.industry !== normalizedIndustry) {
        return false;
      }

      return true;
    });
}

function toFeedItem(card: ExtendedContentCardProps): FeedItem {
  return {
    id: card.id ?? `${card.variant}-${card.title || "untitled"}`,
    type: mapCardVariantToFeedType(card.variant),
    title: card.title || null,
    body: card.description || null,
    imageUrl: card.mainImage || null,
    industry: card.industry || null,
    createdAt: card.createdAt || new Date().toISOString(),
    company: card.criteria?.company
      ? {
          id: card.criteria.companyId || card.criteria.company_id || null,
          name: card.criteria.company,
          logoUrl: card.criteria.companyLogo || null,
        }
      : null,
  };
}

function mapCardVariantToFeedType(
  variant: ExtendedContentCardProps["variant"]
): FeedItemType {
  switch (variant) {
    case "job":
      return "job";
    case "news":
    default:
      return "news";
  }
}
