import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../../hooks/auth/useAuth';
import { useNotifications } from '../../hooks/notifications/useNotifications';

interface NotificationBadgeProps {
  onPress?: () => void;
}

export default function NotificationBadge({ onPress }: NotificationBadgeProps) {
  const { user } = useAuth();
  const { unreadCount } = useNotifications({ autoFetch: true, realtime: true });

  if (!user || unreadCount === 0) {
    return null;
  }

  return (
    <TouchableOpacity onPress={onPress} style={styles.badge}>
      <Text style={styles.badgeText}>
        {unreadCount > 99 ? '99+' : unreadCount.toString()}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    paddingHorizontal: 2,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    // shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 14,
    includeFontPadding: false,
    minWidth: 10, 
    paddingHorizontal: 2, 
  },
});