import Constants from "expo-constants";
import { Flash } from "@/components/ui/Flash";

let lastShownAt = 0;
const THROTTLE_MS = 8000; // avoid spamming every retry burst

async function scheduleLocalNetworkNotification(message: string) {
  if (Constants.executionEnvironment === "storeClient") {
    return;
  }

  try {
    const Notifications = await import("expo-notifications");
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Network issue",
        body: message,
        sound: true,
      },
      trigger: null,
    });
  } catch {}
}

function shouldShow(): boolean {
  const now = Date.now();
  if (now - lastShownAt > THROTTLE_MS) {
    lastShownAt = now;
    return true;
  }
  return false;
}

export function showNetworkIssue(message: string) {
  try {
    if (!shouldShow()) return;
    Flash.show({
      type: "danger",
      message: "Network issue",
      description: message,
    });
  } catch {}
}

export async function notifyNetworkIssue(message: string) {
  try {
    if (!shouldShow()) return;
    await scheduleLocalNetworkNotification(message);
  } catch {}
}

export async function alertAndNotifyNetworkIssue(message: string) {
  // Single gate for both actions so we don't show twice
  if (!shouldShow()) return;
  try {
    Flash.show({
      type: "danger",
      message: "Network issue",
      description: message,
    });
  } catch {}
  try {
    await scheduleLocalNetworkNotification(message);
  } catch {}
}
