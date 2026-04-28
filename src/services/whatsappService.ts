import { Linking, Share, Platform } from 'react-native';
import { formatDisplayDate } from './dateUtils';
import { MealEntry, Person } from '../types/models';

export function buildWhatsAppMessage(
  date: string,
  meals: (MealEntry & { person: Person })[]
): string {
  const header = `🍱 *${formatDisplayDate(date)}*`;
  const lines = meals.map((m) => `• ${m.meal_description}`);
  const total = meals.reduce((s, m) => s + (m.cost ?? 0), 0);
  const parts = [header, ...lines];
  if (total > 0) parts.push(`\n💰 Total: ₹${total.toFixed(0)}`);
  return parts.join('\n');
}

export async function shareOnWhatsApp(message: string): Promise<void> {
  const encoded = encodeURIComponent(message);
  const whatsappUrl = `whatsapp://send?text=${encoded}`;

  try {
    // Try WhatsApp deep link first
    await Linking.openURL(whatsappUrl);
  } catch {
    // Fall back to native share sheet (works on both iOS and Android)
    await Share.share(
      Platform.OS === 'ios'
        ? { message }
        : { message }
    );
  }
}
