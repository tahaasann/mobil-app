import * as Notifications from 'expo-notifications';
import { useRouter, type Href } from 'expo-router';
import { useEffect, type ReactNode } from 'react';

import { parseNotificationDeeplink } from '@/domain/notifications/notification-deeplink';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function navigateFromNotificationData(
  router: ReturnType<typeof useRouter>,
  data: Record<string, unknown> | undefined,
): void {
  const route = parseNotificationDeeplink(data);
  if (route) {
    router.push(route as Href);
  }
}

export function NotificationResponseHandler({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      navigateFromNotificationData(
        router,
        response.notification.request.content.data as Record<string, unknown> | undefined,
      );
    });

    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!response) {
        return;
      }

      navigateFromNotificationData(
        router,
        response.notification.request.content.data as Record<string, unknown> | undefined,
      );
    });

    return () => subscription.remove();
  }, [router]);

  return children;
}
