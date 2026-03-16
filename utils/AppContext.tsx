import { useAuth } from '../hooks/auth';
import { useAds } from '../hooks/search';
import { useApplications } from '../hooks/applications';
import { useBookmarks, useCommentLikes, usePosts } from '../hooks/posts';
import { useInteractions } from '../hooks/posts/useInteractions';
import { createProfileIfNotExists } from './profileUtils';
import { Ad, Application, Post, Profile } from '../types';
import { UserType } from '../types/enums';
import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { supabase, testSupabaseConnection } from './supabase';

interface BookmarkState {
  loading: boolean;
  error: string | null;
  isBookmarked: boolean;
}

interface AppContextType {
  // Authentication
  user: any | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  signIn: (email: string, password: string) => Promise<{ error?: any; data?: any }>;
  signUp: (email: string, password: string, username: string, name: string, surname: string) => Promise<{ error?: any; data?: any }>;
  signOut: () => Promise<any>;
  refreshAuth: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<any>;

  // Posts
  posts: Post[];
  postsLoading: boolean;
  postsError: string | null;
  postsRefreshing: boolean;
  refreshPosts: () => Promise<void>;
  clearPostsError: () => void;

  // Applications
  applications: Application[];
  applicationsLoading: boolean;
  applicationsError: string | null;
  fetchApplications: () => Promise<void>;
  addApplication: (applicationData: Partial<Application>) => Promise<any>;

  // Ads
  ads: Ad[];
  adsLoading: boolean;
  adsError: string | null;
  fetchAds: (status?: any) => Promise<void>;
  addAd: (adData: Partial<Ad>) => Promise<any>;
  recordAdImpression: (adId: string, userId: string) => Promise<any>;

  // Bookmarks
  bookmarks: string[];
  bookmarksLoading: boolean;
  bookmarksError: string | null;
  toggleBookmark: (postId: string) => Promise<any>;
  initializePost: (postId: string) => Promise<any>;
  bookmarkStates: Record<string, BookmarkState>;

  // Comment Likes
  commentLikesLoading: boolean;
  commentLikesError: string | null;
  isCommentLiked: (commentId: string) => Promise<boolean>;
  likeComment: (commentId: string) => Promise<any>;
  unlikeComment: (commentId: string) => Promise<any>;
  toggleCommentLike: (commentId: string) => Promise<any>;
  getCommentLikeCount: (commentId: string) => Promise<number>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // Use the individual hooks to create a unified context
  const auth = useAuth();
  const postsHook = usePosts();
  const applicationsHook = useApplications(auth.user?.id);
  const adsHook = useAds();
  const bookmarksHook = useBookmarks();
  const commentLikesHook = useCommentLikes();
  const interactionsHook = useInteractions();

  // Local state for auth errors
  const [authError, setAuthError] = React.useState<string | null>(null);

  // Initialize state when user changes
  useEffect(() => {
    if (auth.user?.id) {
      const initializeData = async () => {
        try {
          // Test Supabase connection first
          const connectionOk = await testSupabaseConnection();
          if (!connectionOk) {
            console.error('❌ Supabase connection failed during app initialization');
            return;
          }

          await Promise.all([
            postsHook.refresh(),
            applicationsHook.fetchApplications(),
            adsHook.fetchAds()
          ]);
          setAuthError(null);
        } catch (error) {
          console.error('Error initializing data:', error);
        }
      };
      initializeData();
    }
  }, [auth.user?.id]); // Only depend on user ID

  const value: AppContextType = {
    // Auth state and methods
    user: auth.user,
    profile: auth.profile,
    isAuthenticated: !!auth.user,
    isLoading: auth.loading,
    authError: authError, // Use the local state for auth errors
    signIn: async (email: string, password: string) => {
      try {
        setAuthError(null);
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          setAuthError(error.message);
        }
        return { data, error };
      } catch (error: any) {
        const errorMessage = error.message || 'Sign in failed';
        setAuthError(errorMessage);
        return { error: { message: errorMessage } };
      }
    },
    signUp: async (email: string, password: string, username: string, name: string, surname: string) => {
      try {
        setAuthError(null);
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
              name,
              surname,
            },
          },
        });
        if (error) {
          setAuthError(error.message);
          return { data, error };
        }

        let authData = data;

        // In the production-style flow we want users to continue straight into
        // the app after signup. If Supabase doesn't return a live session
        // immediately, attempt a direct sign-in with the same credentials.
        if (data?.user?.id && !data.session) {
          const {
            data: signInData,
            error: signInError,
          } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (signInError) {
            console.warn(
              "Signup succeeded but automatic post-signup sign-in did not complete:",
              signInError.message
            );
          } else if (signInData?.session) {
            authData = {
              ...data,
              session: signInData.session,
              user: signInData.user ?? data.user,
            };
          }
        }

        // The current backend auto-creates profiles through a DB trigger.
        // We only sync legacy Expo fields onto that row.
        if (authData?.user?.id) {
          const syncedProfile = await createProfileIfNotExists(authData.user.id, {
            username,
            name,
            surname,
            user_type: UserType.User,
          });

          if (!syncedProfile) {
            console.warn('Profile sync after signup did not complete immediately');
          }
        }

        return { data: authData, error };
      } catch (error: any) {
        const errorMessage = error.message || 'Sign up failed';
        setAuthError(errorMessage);
        return { error: { message: errorMessage } };
      }
    },
    signOut: auth.signOut,
    refreshAuth: async () => {
      try {
        const { error } = await supabase.auth.refreshSession();
        if (error) {
          console.error('Error refreshing auth:', error);
        }
      } catch (error) {
        console.error('Error refreshing auth:', error);
      }
    },
    updateProfile: auth.updateProfile,

    // Posts state and methods
    posts: postsHook.posts,
    postsLoading: postsHook.loading,
    postsError: postsHook.error,
    postsRefreshing: postsHook.refreshing,
    refreshPosts: async () => postsHook.refresh(),
    clearPostsError: postsHook.clearError,

    // Applications state and methods
    applications: applicationsHook.applications,
    applicationsLoading: applicationsHook.loading,
    applicationsError: applicationsHook.error,
    fetchApplications: applicationsHook.fetchApplications,
    addApplication: applicationsHook.addApplication,

    // Ads state and methods
    ads: adsHook.ads,
    adsLoading: adsHook.loading,
    adsError: adsHook.error,
    fetchAds: adsHook.fetchAds,
    addAd: adsHook.addAd,
    recordAdImpression: adsHook.recordAdImpression,

    bookmarks: [],
    bookmarksLoading: bookmarksHook.loading,
    bookmarksError: bookmarksHook.error,
    toggleBookmark: interactionsHook.toggleBookmark,
    initializePost: interactionsHook.initializePost,
    bookmarkStates: interactionsHook.bookmarkStates,

    // Comment Likes state and methods
    commentLikesLoading: commentLikesHook.loading,
    commentLikesError: commentLikesHook.error,
    isCommentLiked: async (commentId: string) => commentLikesHook.isLiked(commentId),
    likeComment: commentLikesHook.likeComment,
    unlikeComment: commentLikesHook.unlikeComment,
    toggleCommentLike: commentLikesHook.toggleCommentLike,
    getCommentLikeCount: async (commentId: string) => commentLikesHook.getCommentLikeCount(commentId),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
