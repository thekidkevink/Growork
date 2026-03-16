import { useInteractions } from './useInteractions';

export function useLikes() {
  const {
    likePost,
    unlikePost,
    toggleLike,
    likeStates,
    initializePost
  } = useInteractions();

  return {
    loading: false,
    error: null,
    isLiked: (postId: string) => likeStates[postId]?.isLiked || false,
    likePost,
    unlikePost,
    toggleLike,
    likeStates,
    initializePost
  };
}