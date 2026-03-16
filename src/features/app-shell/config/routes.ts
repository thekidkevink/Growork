export const appRoutes = {
  auth: {
    email: '/auth/email',
    username: '/auth/username',
    success: '/auth/success',
    verify: '/auth/verify',
    login: '/auth/login',
  },
  tabs: {
    home: '/(tabs)',
    jobsApplications: '/(tabs)/applications',
    search: '/(tabs)/search',
    bookmarks: '/(tabs)/bookmarks',
    profile: '/(tabs)/profile',
  },
  content: {
    post: (id: string) => `/post/${id}`,
    company: (id: string) => `/company/${id}`,
    application: (id: string) => `/application/${id}`,
  },
} as const;

export type AppRoute =
  | (typeof appRoutes.auth)[keyof typeof appRoutes.auth]
  | (typeof appRoutes.tabs)[keyof typeof appRoutes.tabs];
