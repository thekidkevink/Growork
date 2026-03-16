// Main consolidated posts hook
export { usePosts } from './usePosts';

// Specialized variants for specific use cases
export {
  useHomePosts,
  useFeedPosts,
  useMyPosts,
  useSearchPosts,
  usePostsByType
} from './usePosts';

// Consolidated interaction hooks
export { useInteractions } from './useInteractions';
export { useComments } from './useComments';

// Additional post hooks
export { usePostOperations } from './usePostOperations';
export { usePostById } from './usePostById';
export { useHomeFeed } from './useHomeFeed';
export { useCommentOperations } from './useCommentOperations';
export { useTextToSpeech } from './useTextToSpeech';
export { useCompanyPosts } from './useCompanyPosts';

// Post creation function
export { addPost } from './usePostOperations';

// Legacy exports for backward compatibility (deprecated)
export { useBookmarks } from './useBookmarks';
export { useLikes } from './useLikes';
export { useCommentLikes } from './useCommentLikes';

// Types
export type {
  PostWithProfile,
  PostFetchConfig
} from './usePosts';

// Extended types for specific use cases
export type MyPost = import('./usePosts').PostWithProfile & {
  is_active: boolean;
  applications_count: number;
};

export type {
  InteractionState,
  LikeState,
  BookmarkState
} from './useInteractions';

export type {
  Comment,
  CommentState as CommentStateType
} from './useComments';
