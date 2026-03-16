import type { AppRoute } from '@/src/features/app-shell/config/routes';
import { appRoutes } from '@/src/features/app-shell/config/routes';

export type RootTabId = 'home' | 'jobs' | 'search' | 'bookmarks' | 'profile';

export interface RootTabConfig {
  id: RootTabId;
  label: string;
  route: AppRoute;
  icon: string;
  accessibilityLabel: string;
}

export const rootTabs: RootTabConfig[] = [
  {
    id: 'home',
    label: 'Home',
    route: appRoutes.tabs.home,
    icon: 'home',
    accessibilityLabel: 'Home tab',
  },
  {
    id: 'jobs',
    label: 'Jobs',
    route: appRoutes.tabs.jobsApplications,
    icon: 'briefcase',
    accessibilityLabel: 'Jobs and applications tab',
  },
  {
    id: 'search',
    label: 'Search',
    route: appRoutes.tabs.search,
    icon: 'search',
    accessibilityLabel: 'Search tab',
  },
  {
    id: 'bookmarks',
    label: 'Bookmarks',
    route: appRoutes.tabs.bookmarks,
    icon: 'bookmark',
    accessibilityLabel: 'Bookmarks tab',
  },
  {
    id: 'profile',
    label: 'Profile',
    route: appRoutes.tabs.profile,
    icon: 'user',
    accessibilityLabel: 'Profile tab',
  },
];
