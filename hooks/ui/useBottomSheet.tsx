import { useState, useCallback, createContext, useContext, ReactNode } from 'react';

interface CommentsBottomSheetContextType {
    isVisible: boolean;
    currentPostId: string | null;
    currentPostOwnerId: string | null;
    openCommentsSheet: (postId: string, postOwnerId?: string) => void;
    closeCommentsSheet: () => void;
}

const CommentsBottomSheetContext = createContext<CommentsBottomSheetContextType | undefined>(undefined);

export function CommentsBottomSheetProvider({ children }: { children: ReactNode }) {
    const [isVisible, setIsVisible] = useState(false);
    const [currentPostId, setCurrentPostId] = useState<string | null>(null);
    const [currentPostOwnerId, setCurrentPostOwnerId] = useState<string | null>(null);

    const openCommentsSheet = useCallback((postId: string, postOwnerId?: string) => {
        setCurrentPostId(postId);
        setCurrentPostOwnerId(postOwnerId || null);
        setIsVisible(true);
    }, []);

    const closeCommentsSheet = useCallback(() => {
        setIsVisible(false);
        setCurrentPostId(null);
        setCurrentPostOwnerId(null);
    }, []);

    return (
        <CommentsBottomSheetContext.Provider
            value={{
                isVisible,
                currentPostId,
                currentPostOwnerId,
                openCommentsSheet,
                closeCommentsSheet,
            }}
        >
            {children}
        </CommentsBottomSheetContext.Provider>
    );
}

export function useCustomCommentsBottomSheet() {
    const context = useContext(CommentsBottomSheetContext);
    if (context === undefined) {
        throw new Error('useCustomCommentsBottomSheet must be used within a CommentsBottomSheetProvider');
    }
    return context;
} 