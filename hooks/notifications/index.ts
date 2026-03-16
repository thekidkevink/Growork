// Main consolidated notifications hook
export { useNotifications } from './useNotifications';

// Specialized variants for specific notification types
export {
    useGeneralNotifications,
    useInteractionNotifications,
    useNotificationOperations
} from './useNotifications';

// Other notification hooks
export { useNotificationSetup } from './useNotificationSetup';
export { usePushNotifications } from './usePushNotifications';

// Types
export type { NotificationConfig } from './useNotifications';
