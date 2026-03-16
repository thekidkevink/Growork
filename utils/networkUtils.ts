import NetInfo from '@react-native-community/netinfo';

export interface NetworkStatus {
    isConnected: boolean;
    isInternetReachable: boolean | null;
    type: string | null;
}

export const checkNetworkStatus = async (): Promise<NetworkStatus> => {
    try {
        const state = await NetInfo.fetch();
        return {
            isConnected: state.isConnected ?? false,
            isInternetReachable: state.isInternetReachable,
            type: state.type
        };
    } catch (error) {
        console.error('Error checking network status:', error);
        return {
            isConnected: false,
            isInternetReachable: false,
            type: null
        };
    }
};

export const getNetworkErrorMessage = (error: any): string => {
    const errorMessage = error?.message?.toLowerCase() || '';
    const errorName = (error?.name || '').toLowerCase();

    if (errorMessage.includes('network request failed')) {
        return 'Network connection failed. Please check your internet connection and try again.';
    }

    if (errorMessage.includes('timeout')) {
        return 'Request timed out. Please check your connection and try again.';
    }

    // Handle fetch aborts coming from AbortController / whatwg-fetch (often surfaced as DOMException: Aborted)
    if (errorName === 'aborterror' || errorMessage.includes('aborted') || errorMessage.includes('abort')) {
        return 'Request was canceled or timed out. Please try again.';
    }

    if (errorMessage.includes('upstream connect error') ||
        errorMessage.includes('connection timeout') ||
        errorMessage.includes('disconnect/reset before headers')) {
        return 'Connection to server failed. Please check your internet connection.';
    }

    if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
        return 'Authentication required. Please log in again.';
    }

    return 'An unexpected error occurred. Please try again.';
};

export const isNetworkError = (error: any): boolean => {
    const errorMessage = error?.message?.toLowerCase() || '';
    const errorName = (error?.name || '').toLowerCase();
    return errorName === 'aborterror' ||
        errorMessage.includes('aborted') ||
        errorMessage.includes('abort') ||
        errorMessage.includes('network') ||
        errorMessage.includes('timeout') ||
        errorMessage.includes('connection') ||
        errorMessage.includes('upstream');
};
