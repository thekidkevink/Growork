import React, { createContext, useContext, useEffect } from 'react';
import { useNotificationSetup , usePushNotifications } from '@/hooks';
import { checkNotificationPermissions, requestNotificationPermissions } from '@/utils/notifications';

type NotificationContextType = {
    sendNotification: (title: string, body: string, data?: any) => Promise<void>;
    showLocalNotification: (title: string, body: string, data?: any) => Promise<void>;
    checkPermissions: () => Promise<boolean>;
    requestPermissions: () => Promise<boolean>;
};

const NotificationContext = createContext<NotificationContextType>({
    sendNotification: async () => { },
    showLocalNotification: async () => { },
    checkPermissions: async () => false,
    requestPermissions: async () => false,
});

export function useNotifications() {
    return useContext(NotificationContext);
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    // Set up notification system
    useNotificationSetup();

    // Get notification functionality
    const { sendNotification, showLocalNotification } = usePushNotifications();

    // Check permissions on mount
    useEffect(() => {
        const checkPermissionsOnMount = async () => {
            const granted = await checkNotificationPermissions();
            if (!granted) {
                await requestNotificationPermissions();
            }
        };

        checkPermissionsOnMount();
    }, []);

    const checkPermissions = async () => {
        return await checkNotificationPermissions();
    };

    const requestPermissions = async () => {
        return await requestNotificationPermissions();
    };

    return (
        <NotificationContext.Provider value={{ 
            sendNotification, 
            showLocalNotification,
            checkPermissions,
            requestPermissions
        }}>
            {children}
        </NotificationContext.Provider>
    );
}
