import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { handleNotificationResponse, checkNotificationPermissions, requestNotificationPermissions } from '@/utils/notifications';

export function useNotificationSetup() {
    const notificationListener = useRef<{ remove: () => void } | null>(null);
    const responseListener = useRef<{ remove: () => void } | null>(null);

    useEffect(() => {
        const isExpoGo = Constants.executionEnvironment === 'storeClient';
        let isMounted = true;

        const setupNotifications = async () => {
            if (isExpoGo) {
                return;
            }

            const Notifications = await import('expo-notifications').catch(() => null);
            if (!Notifications || !isMounted) {
                return;
            }

            await registerForPushNotificationsAsync(Notifications);

            notificationListener.current = Notifications.addNotificationReceivedListener(() => {
                // Local notification handling is already configured globally.
            });

            responseListener.current = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);
        };

        setupNotifications();

        return () => {
            isMounted = false;
            if (notificationListener.current) {
                notificationListener.current.remove();
            }
            if (responseListener.current) {
                responseListener.current.remove();
            }
        };
    }, []);
}

async function registerForPushNotificationsAsync(
    Notifications: typeof import('expo-notifications')
) {
    if (!Device.isDevice) {
        console.warn('Must use physical device for Push Notifications');
        return;
    }

    const executionEnvironment = Constants.executionEnvironment;
    const isExpoGo = executionEnvironment === 'storeClient';

    // Set up Android channel
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    // Check permissions
    let hasPermission = await checkNotificationPermissions();
    if (!hasPermission) {
        hasPermission = await requestNotificationPermissions();
        if (!hasPermission) {
            console.warn('Failed to get push token for push notification!');
            return;
        }
    }

    try {
        // Get project ID from app.json
        const projectId =
            Constants.easConfig?.projectId ||
            Constants.expoConfig?.extra?.eas?.projectId;

        if (isExpoGo) {
            console.warn('Skipping remote push token registration in Expo Go. Use a development build for push notifications.');
            return;
        }

        if (!projectId) {
            console.warn('Skipping remote push token registration because no Expo project ID is configured.');
            return;
        }

        // Get push token
        const token = await Notifications.getExpoPushTokenAsync({
            projectId
        });

        return token.data;
    } catch (_error) {
        console.warn('Push token registration is unavailable in this environment.');
    }
}
