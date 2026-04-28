import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getMealEntriesForExport } from '../db/repositories/mealEntryRepository';
import { formatDisplayDate } from './dateUtils';

function escapeCsv(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function exportCSV(startDate: string, endDate: string): Promise<void> {
  const rows = await getMealEntriesForExport(startDate, endDate);

  const headers = [
    'Date', 'Person Name', 'Phone', 'Meal Description',
    'Total Cost (₹)', 'Per-Person Share (₹)', 'Paid By', 'Splitwise Synced',
  ];

  const dataRows = rows.map((r: any) => {
    const participantCount = rows.filter((x: any) => x.date === r.date).length;
    const perShare = r.total_cost !== null ? (r.total_cost / participantCount).toFixed(2) : '';
    return [
      formatDisplayDate(r.date),
      r.person_name,
      r.phone_number,
      r.meal_description,
      r.total_cost !== null ? r.total_cost.toFixed(2) : '',
      perShare,
      r.paid_by_name ?? '',
      r.splitwise_synced ? 'Yes' : 'No',
    ].map(escapeCsv).join(',');
  });

  const csv = [headers.join(','), ...dataRows].join('\n');
  const filename = `office-food-${startDate}-to-${endDate}.csv`;

  const file = new File(Paths.cache, filename);
  file.write(csv);

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(file.uri, {
      mimeType: 'text/csv',
      dialogTitle: 'Export Office Food Data',
      UTI: 'public.comma-separated-values-text',
    });
  }
}
