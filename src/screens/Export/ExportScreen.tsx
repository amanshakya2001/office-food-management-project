import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../../components/ui/AppText';
import { AppButton } from '../../components/ui/AppButton';
import { AppInput } from '../../components/ui/AppInput';
import { Colors, Spacing } from '../../theme/tokens';
import { getDayEntriesInRange } from '../../db/repositories/dayEntryRepository';
import { exportCSV } from '../../services/csvExportService';
import { currentMonthRange, formatDisplayDate } from '../../services/dateUtils';

export function ExportScreen() {
  const insets = useSafeAreaInsets();
  const { start: defaultStart, end: defaultEnd } = currentMonthRange();
  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  async function handlePreview() {
    setPreviewing(true);
    try {
      const entries = await getDayEntriesInRange(startDate, endDate);
      setPreviewCount(entries.length);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setPreviewing(false);
    }
  }

  async function handleExport() {
    if (!startDate || !endDate) {
      Alert.alert('Missing dates', 'Please enter start and end dates.');
      return;
    }
    if (startDate > endDate) {
      Alert.alert('Invalid range', 'Start date must be before end date.');
      return;
    }
    setExporting(true);
    try {
      await exportCSV(startDate, endDate);
    } catch (e: any) {
      Alert.alert('Export failed', e.message);
    } finally {
      setExporting(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.LG }]}>
      <AppText variant="SCREEN_TITLE" style={styles.heading}>CSV Export</AppText>

      <AppText variant="LIST_SUBTITLE" color={Colors.TEXT_SECONDARY} style={styles.desc}>
        Export food log data as CSV. Use YYYY-MM-DD format for dates.
      </AppText>

      <AppInput
        label="Start date"
        placeholder="YYYY-MM-DD"
        value={startDate}
        onChangeText={setStartDate}
        mono
        style={{ marginBottom: Spacing.MD }}
      />
      <AppInput
        label="End date"
        placeholder="YYYY-MM-DD"
        value={endDate}
        onChangeText={setEndDate}
        mono
        style={{ marginBottom: Spacing.LG }}
      />

      <AppButton
        label="Preview Range"
        variant="secondary"
        onPress={handlePreview}
        loading={previewing}
        style={{ marginBottom: Spacing.SM }}
      />

      {previewCount !== null && (
        <View style={styles.previewCard}>
          <AppText variant="LIST_TITLE" color={Colors.ACCENT_TEXT}>{previewCount} day entries</AppText>
          <AppText variant="CAPTION" color={Colors.TEXT_SECONDARY}>
            {previewCount > 0
              ? `${formatDisplayDate(startDate)} — ${formatDisplayDate(endDate)}`
              : 'No entries in this range'}
          </AppText>
        </View>
      )}

      <AppButton
        label={exporting ? 'Exporting...' : 'Export & Share CSV'}
        onPress={handleExport}
        loading={exporting}
        disabled={previewCount === 0}
        style={{ marginTop: Spacing.MD }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BG },
  content: { padding: Spacing.LG, paddingBottom: Spacing.XXL, paddingTop: Spacing.LG },
  heading: { marginBottom: Spacing.SM },
  desc: { marginBottom: Spacing.LG },
  previewCard: {
    backgroundColor: Colors.ACCENT_MUTED,
    borderRadius: 12,
    padding: Spacing.MD,
    alignItems: 'center',
    marginTop: Spacing.SM,
  },
});
