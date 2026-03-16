// components/ui/Flash.tsx
import FlashMessage, { hideMessage, showMessage } from 'react-native-flash-message';

export const Flash = {
  show: showMessage,
  hide: hideMessage,
};

export function useFlashToast() {
  return {
    show: ({
      title,
      message,
      type = 'default',
    }: {
      title: string;
      message?: string;
      type?: 'success' | 'danger' | 'info' | 'default';
    }) =>
      showMessage({
        message: title,
        description: message,
        type,
        floating: true,
        duration: 3000,
      }),
  };
}

export default function FlashBar() {
  return (
    <FlashMessage
      position="top"
      floating
      duration={3000}
      titleStyle={{ fontWeight: 'bold', fontSize: 15 }}
      textStyle={{ fontSize: 14 }}
    />
  );
}
