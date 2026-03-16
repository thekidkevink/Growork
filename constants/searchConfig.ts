import { PostType } from "@/types";

// Filter options for content categories
export const FILTER_OPTIONS = [
  { key: "all", label: "All" },
  { key: "jobs", label: "Jobs" },
  { key: "news", label: "News" },
] as const;

export type FilterKey = (typeof FILTER_OPTIONS)[number]["key"];

// Search helper functions
export function filterPostsByType(posts: any[], type?: PostType) {
  if (!type) return posts;
  return posts.filter((p) => p.type === type);
}

export function filterPostsByIndustry(posts: any[], industry?: string) {
  if (!industry) return posts;
  return posts.filter(
    (p) => (p.industry || "").toLowerCase() === industry.toLowerCase()
  );
}

export function filterPostsBySearchTerm(posts: any[], searchTerm: string) {
  if (!searchTerm.trim()) return posts;

  const term = searchTerm.trim().toLowerCase();
  return posts.filter(
    (p) =>
      (p.title && p.title.toLowerCase().includes(term)) ||
      (p.content && p.content.toLowerCase().includes(term)) ||
      (p.criteria?.company &&
        p.criteria.company.toLowerCase().includes(term)) ||
      (p.criteria?.location &&
        p.criteria.location.toLowerCase().includes(term)) ||
      (p.industry && p.industry.toLowerCase().includes(term))
  );
}
