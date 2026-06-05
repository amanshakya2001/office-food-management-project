import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIF_ENABLED_KEY = 'lunch_reminder_enabled';
const NOTIF_HOUR_KEY = 'lunch_reminder_hour';
const NOTIF_MINUTE_KEY = 'lunch_reminder_minute';
const NOTIF_ID_KEY = 'lunch_reminder_notif_id';

export const DEFAULT_HOUR = 13;
export const DEFAULT_MINUTE = 0;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleLunchReminder(hour: number, minute: number): Promise<void> {
  // Cancel any existing reminder first
  await cancelLunchReminder();

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Time to log lunch! 🍱",
      body: "Don't forget to add today's food entry.",
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });

  await AsyncStorage.setItem(NOTIF_ID_KEY, id);
  await AsyncStorage.setItem(NOTIF_ENABLED_KEY, 'true');
  await AsyncStorage.setItem(NOTIF_HOUR_KEY, String(hour));
  await AsyncStorage.setItem(NOTIF_MINUTE_KEY, String(minute));
}

export async function cancelLunchReminder(): Promise<void> {
  const id = await AsyncStorage.getItem(NOTIF_ID_KEY);
  if (id) {
    await Notifications.cancelScheduledNotificationAsync(id);
    await AsyncStorage.removeItem(NOTIF_ID_KEY);
  }
  await AsyncStorage.setItem(NOTIF_ENABLED_KEY, 'false');
}

export async function loadReminderSettings(): Promise<{
  enabled: boolean;
  hour: number;
  minute: number;
}> {
  const [enabled, hour, minute] = await Promise.all([
    AsyncStorage.getItem(NOTIF_ENABLED_KEY),
    AsyncStorage.getItem(NOTIF_HOUR_KEY),
    AsyncStorage.getItem(NOTIF_MINUTE_KEY),
  ]);
  return {
    enabled: enabled === 'true',
    hour: hour !== null ? parseInt(hour, 10) : DEFAULT_HOUR,
    minute: minute !== null ? parseInt(minute, 10) : DEFAULT_MINUTE,
  };
}
