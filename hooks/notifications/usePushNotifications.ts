import { useState, useCallback } from 'react';
import {
  checkNotificationPermissions,
  requestNotificationPermissions,
  scheduleLocalNotification,
} from '@/utils/notifications';

type NotificationPermissionState = 'default' | 'granted' | 'denied';

export function usePushNotifications() {
  const [permissions, setPermissions] =
    useState<NotificationPermissionState>('default');

  const sendNotification = useCallback(
    async (title: string, body: string, data?: any) => {
      try {
        const granted = await checkNotificationPermissions();
        if (!granted) {
          console.warn('Notifications not permitted on this device');
          return;
        }

        await scheduleLocalNotification(title, body, data);
      } catch (error) {
        console.error('Error sending notification:', error);
        throw error;
      }
    },
    []
  );

  const showLocalNotification = useCallback(
    async (title: string, body: string, data?: any) => {
      try {
        const granted = await checkNotificationPermissions();
        if (!granted) {
          console.warn('Notifications not permitted on this device');
          return;
        }

        await scheduleLocalNotification(title, body, data);
      } catch (error) {
        console.error('Error showing local notification:', error);
        throw error;
      }
    },
    []
  );

  const checkPermissions = useCallback(async () => {
    try {
      const granted = await checkNotificationPermissions();
      setPermissions(granted ? 'granted' : 'denied');
      return granted;
    } catch (error) {
      console.error('Error checking notification permissions:', error);
      return false;
    }
  }, []);

  const requestPermissions = useCallback(async () => {
    try {
      const granted = await requestNotificationPermissions();
      setPermissions(granted ? 'granted' : 'denied');
      return granted;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }, []);

  return {
    sendNotification,
    showLocalNotification,
    checkPermissions,
    requestPermissions,
    permissions,
  };
}
