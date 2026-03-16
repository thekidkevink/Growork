import Constants from 'expo-constants';
import { supabase } from './supabase';
import { supabaseRequest } from './supabaseRequest';

type NotificationResponseLike = {
  notification: {
    request: {
      content: {
        data?: Record<string, any>;
      };
    };
  };
  actionIdentifier?: string;
};

type NotificationsModule = typeof import('expo-notifications');

export enum NotificationType {
  POST_LIKE = 'post_like',
  POST_COMMENT = 'post_comment',
  POST_BOOKMARK = 'post_bookmark',
  COMMENT_LIKE = 'comment_like',
  APPLICATION_STATUS = 'application_status',
  COMPANY_STATUS = 'company_status',
}

const isExpoGo = () => Constants.executionEnvironment === 'storeClient';

let notificationsModulePromise: Promise<NotificationsModule | null> | null = null;

async function getNotificationsModule() {
  if (isExpoGo()) {
    return null;
  }

  if (!notificationsModulePromise) {
    notificationsModulePromise = import('expo-notifications')
      .then((Notifications) => {
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
            shouldShowBanner: true,
            shouldShowList: true,
          }),
        });
        return Notifications;
      })
      .catch(() => null);
  }

  return notificationsModulePromise;
}

export async function checkNotificationPermissions(): Promise<boolean> {
  try {
    const Notifications = await getNotificationsModule();
    if (!Notifications) {
      return false;
    }

    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error checking notification permissions:', error);
    return false;
  }
}

export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const Notifications = await getNotificationsModule();
    if (!Notifications) {
      return false;
    }

    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

export async function sendPushNotification(
  expoPushToken: string,
  title: string,
  body: string,
  data?: any
) {
  try {
    const message = {
      to: expoPushToken,
      sound: 'default',
      title,
      body,
      data: data || {},
    };

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`Push notification failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw error;
  }
}

export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: any
) {
  try {
    const Notifications = await getNotificationsModule();
    if (!Notifications) {
      return;
    }

    const hasPermission = await checkNotificationPermissions();
    if (!hasPermission) {
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
      },
      trigger: null,
    });
  } catch (error) {
    console.error('Error scheduling local notification:', error);
    throw error;
  }
}

export async function saveNotificationToDatabase(
  userId: string,
  title: string,
  body: string,
  type: string,
  data?: any
) {
  try {
    await supabaseRequest<void>(
      async () => {
        const { error, status } = await supabase.from('notifications').insert({
          user_id: userId,
          title,
          body,
          type,
          data: data || {},
        });
        return { data: null, error, status };
      },
      { logTag: 'notifications:save' }
    );
  } catch (error) {
    console.error('Error saving notification to database:', error);
    throw error;
  }
}

export async function sendNotification(
  userId: string,
  title: string,
  body: string,
  type: string,
  data?: any,
  expoPushToken?: string
) {
  try {
    await saveNotificationToDatabase(userId, title, body, type, data);

    if (expoPushToken) {
      await sendPushNotification(expoPushToken, title, body, data);
    } else {
      await scheduleLocalNotification(title, body, data);
    }
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}

export function handleNotificationResponse(response: NotificationResponseLike) {
  const data = response.notification.request.content.data;
  const postId = data?.postId || data?.post_id;
  const applicationId = data?.applicationId || data?.application_id;
  const companyId = data?.companyId || data?.company_id;

  console.log('Notification response:', {
    actionIdentifier: response.actionIdentifier,
    data,
  });

  if (data?.type === NotificationType.POST_LIKE && postId) {
    return;
  }

  if (data?.type === NotificationType.APPLICATION_STATUS && applicationId) {
    return;
  }

  if (data?.type === NotificationType.COMPANY_STATUS && companyId) {
    return;
  }
}

export async function sendApplicationStatusNotification(
  userId: string,
  status: string,
  jobTitle: string,
  expoPushToken?: string
) {
  const title = 'Application Status Update';
  const body = `Your application for "${jobTitle}" has been ${status}`;

  await sendNotification(
    userId,
    title,
    body,
    NotificationType.APPLICATION_STATUS,
    { status, jobTitle },
    expoPushToken
  );
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    await supabaseRequest<void>(
      async () => {
        const { error, status } = await supabase
          .from('notifications')
          .update({ read: true })
          .eq('id', notificationId);
        return { data: null, error, status };
      },
      { logTag: 'notifications:markRead' }
    );
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

export async function markAllNotificationsAsRead(userId: string) {
  try {
    await supabaseRequest<void>(
      async () => {
        const { error, status } = await supabase
          .from('notifications')
          .update({ read: true })
          .eq('user_id', userId)
          .eq('read', false);
        return { data: null, error, status };
      },
      { logTag: 'notifications:markAllRead' }
    );
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
}

export async function sendTestNotification(userId: string) {
  try {
    await sendNotification(
      userId,
      'Test Notification',
      'This is a test notification to verify the system is working!',
      'test',
      { test: true, timestamp: new Date().toISOString() }
    );

    return true;
  } catch (error) {
    console.error('Test notification failed:', error);
    return false;
  }
}

export async function getNotifications(userId: string, limit = 50) {
  try {
    const { data } = await supabaseRequest<any[]>(
      async () => {
        const { data, error, status } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit);
        return { data, error, status };
      },
      { logTag: 'notifications:list' }
    );

    return data || [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
}
