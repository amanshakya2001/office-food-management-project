import React, { useCallback, useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppText } from '../../components/ui/AppText';
import { EmptyState } from '../../components/ui/EmptyState';
import { DayEntryCard } from '../../components/shared/DayEntryCard';
import { Colors, Spacing } from '../../theme/tokens';
import { getAllDayEntries } from '../../db/repositories/dayEntryRepository';
import { getMealEntriesByDayEntry } from '../../db/repositories/mealEntryRepository';
import { DayEntry } from '../../types/models';
import { currentMonthRange } from '../../services/dateUtils';

import { HomeStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'Home'>;

interface EntryWithParticipants {
  entry: DayEntry;
  participantNames: string[];
}

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const [entries, setEntries] = useState<EntryWithParticipants[]>([]);
  const [monthTotal, setMonthTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const all = await getAllDayEntries();
    const withParticipants = await Promise.all(
      all.map(async (entry) => {
        const meals = await getMealEntriesByDayEntry(entry.id);
        const names = [...new Set(meals.map((m) => m.person.name))];
        return { entry, participantNames: names };
      })
    );
    setEntries(withParticipants);

    const { start, end } = currentMonthRange();
    const total = withParticipants
      .filter((e) => e.entry.date >= start && e.entry.date <= end)
      .reduce((sum, e) => sum + (e.entry.total_cost ?? 0), 0);
    setMonthTotal(total);
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.SM }]}>
        <AppText variant="SCREEN_TITLE">Food Log</AppText>
        <TouchableOpacity
          onPress={() => navigation.navigate('NewEntry', {})}
          style={styles.addBtn}
        >
          <AppText variant="BUTTON" color={Colors.BG}>+ New Day</AppText>
        </TouchableOpacity>
      </View>

      {entries.length > 0 && (
        <View style={styles.statsBanner}>
          <View style={styles.stat}>
            <AppText variant="HERO_NUMBER" color={Colors.ACCENT_TEXT}>₹{monthTotal.toFixed(0)}</AppText>
            <AppText variant="CAPTION" color={Colors.TEXT_SECONDARY}>This month</AppText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <AppText variant="HERO_NUMBER" color={Colors.TEXT_PRIMARY}>{entries.length}</AppText>
            <AppText variant="CAPTION" color={Colors.TEXT_SECONDARY}>Total days</AppText>
          </View>
        </View>
      )}

      <FlatList
        data={entries}
        keyExtractor={(item) => String(item.entry.id)}
        renderItem={({ item }) => (
          <DayEntryCard
            entry={item.entry}
            participantNames={item.participantNames}
            onPress={() => navigation.navigate('DayDetail', { dayEntryId: item.entry.id })}
          />
        )}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              title="No entries yet"
              subtitle="Tap '+ New Day' to log your first food entry"
            />
          ) : null
        }
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BG },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.LG,
    paddingBottom: Spacing.MD,
  },
  addBtn: {
    backgroundColor: Colors.ACCENT,
    paddingHorizontal: Spacing.MD,
    paddingVertical: Spacing.XS + 2,
    borderRadius: 10,
  },
  statsBanner: {
    flexDirection: 'row',
    backgroundColor: Colors.SURFACE,
    marginHorizontal: Spacing.LG,
    borderRadius: 12,
    padding: Spacing.MD,
    marginBottom: Spacing.MD,
  },
  stat: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: Colors.BORDER },
  list: { paddingBottom: Spacing.XXL },
});
