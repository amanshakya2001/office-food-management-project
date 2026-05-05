import React, { useCallback, useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppText } from '../../components/ui/AppText';
import { AppButton } from '../../components/ui/AppButton';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Divider } from '../../components/ui/Divider';
import { Colors, Spacing } from '../../theme/tokens';
import { getDayEntryById, deleteDayEntry } from '../../db/repositories/dayEntryRepository';
import { getMealEntriesByDayEntry, deleteMealEntry } from '../../db/repositories/mealEntryRepository';
import { getPersonById } from '../../db/repositories/personRepository';
import { DayEntry, MealEntry, Person } from '../../types/models';
import { formatDisplayDate } from '../../services/dateUtils';
import { buildWhatsAppMessage, shareOnWhatsApp } from '../../services/whatsappService';
import { syncToSplitwise } from '../../services/splitwiseSync';
import { useOwner } from '../../context/OwnerContext';
import { HomeStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'DayDetail'>;
type Route = RouteProp<HomeStackParamList, 'DayDetail'>;

export function DayDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { dayEntryId } = route.params;
  const { isOwner } = useOwner();

  const [dayEntry, setDayEntry] = useState<DayEntry | null>(null);
  const [meals, setMeals] = useState<(MealEntry & { person: Person })[]>([]);
  const [payer, setPayer] = useState<Person | null>(null);
  const [syncing, setSyncing] = useState(false);

  const load = useCallback(async () => {
    const entry = await getDayEntryById(dayEntryId);
    if (!entry) return;
    setDayEntry(entry);
    const mealList = await getMealEntriesByDayEntry(dayEntryId);
    setMeals(mealList);
    if (entry.paid_by_person_id) {
      const p = await getPersonById(entry.paid_by_person_id);
      setPayer(p);
    } else {
      setPayer(null);
    }
  }, [dayEntryId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function handleSync() {
    if (!dayEntry || !payer) return;
    if (dayEntry.splitwise_synced) {
      Alert.alert(
        'Already Synced',
        'This entry is already synced. Do you want to update the Splitwise expense?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Update', onPress: doSync },
        ]
      );
    } else {
      doSync();
    }
  }

  async function doSync() {
    if (!dayEntry || !payer) return;
    setSyncing(true);
    try {
      await syncToSplitwise(dayEntry, meals, payer);
      await load();
      Alert.alert('Synced!', 'Expense synced to Splitwise successfully.');
    } catch (e: any) {
      Alert.alert('Sync failed', e.message);
    } finally {
      setSyncing(false);
    }
  }

  function handleRemoveFromApp() {
    Alert.alert(
      'Remove from app?',
      'This will delete the entry. The Splitwise expense will NOT be affected.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await deleteDayEntry(dayEntryId);
            navigation.goBack();
          },
        },
      ]
    );
  }

  async function handleWhatsApp() {
    if (!dayEntry) return;
    const message = buildWhatsAppMessage(dayEntry.date, meals);
    await shareOnWhatsApp(message);
  }

  async function handleDeleteMeal(mealId: number) {
    if (!isOwner) return;
    Alert.alert('Remove meal?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await deleteMealEntry(mealId);
          await load();
        },
      },
    ]);
  }

  if (!dayEntry) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={Colors.ACCENT} />
      </View>
    );
  }

  const uniqueParticipants = meals.filter(
    (m, i, arr) => arr.findIndex((x) => x.person_id === m.person_id) === i
  ).map((m) => m.person);

  const perShare =
    dayEntry.total_cost !== null && uniqueParticipants.length > 0
      ? dayEntry.total_cost / uniqueParticipants.length
      : null;

  const canSync =
    isOwner &&
    dayEntry.total_cost !== null &&
    payer !== null &&
    uniqueParticipants.every((p) => p.splitwise_user_id);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.titleRow}>
        <AppText variant="SCREEN_TITLE">{formatDisplayDate(dayEntry.date)}</AppText>
        {dayEntry.splitwise_synced ? (
          <Badge label="Synced" variant="success" />
        ) : dayEntry.total_cost !== null ? (
          <Badge label="Unsynced" variant="accent" />
        ) : (
          <Badge label="Cost pending" variant="neutral" />
        )}
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity onPress={handleWhatsApp} style={styles.waBtn}>
          <AppText variant="BUTTON" color={Colors.SUCCESS_TEXT}>Share WhatsApp</AppText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('NewEntry', { date: dayEntry.date })}
          style={styles.editBtn}
        >
          <AppText variant="BUTTON" color={Colors.TEXT_SECONDARY}>+ Add meal</AppText>
        </TouchableOpacity>
      </View>

      <Divider />

      <AppText variant="SECTION_HEADER" color={Colors.TEXT_TERTIARY} style={styles.sectionLabel}>
        MEALS
      </AppText>

      {meals.map((meal) => (
        <View key={meal.id} style={styles.mealRow}>
          <View style={styles.mealLeft}>
            <Avatar name={meal.person.name} size="SM" />
            <View style={{ marginLeft: Spacing.SM, flex: 1 }}>
              <AppText variant="CAPTION" color={Colors.TEXT_SECONDARY}>{meal.person.name}</AppText>
              <AppText variant="MEAL_DESCRIPTION">{meal.meal_description}</AppText>
            </View>
          </View>
          {isOwner && (
            <TouchableOpacity onPress={() => handleDeleteMeal(meal.id)}>
              <AppText variant="CAPTION" color={Colors.TEXT_TERTIARY}>✕</AppText>
            </TouchableOpacity>
          )}
        </View>
      ))}

      <Divider />

      <AppText variant="SECTION_HEADER" color={Colors.TEXT_TERTIARY} style={styles.sectionLabel}>
        COST
      </AppText>

      <View style={styles.costSection}>
        <View style={styles.costRow}>
          <AppText variant="LIST_SUBTITLE" color={Colors.TEXT_SECONDARY}>Total cost</AppText>
          <AppText variant="LIST_TITLE" color={Colors.ACCENT_TEXT}>
            {dayEntry.total_cost !== null ? `₹${dayEntry.total_cost.toFixed(2)}` : '—'}
          </AppText>
        </View>
        {perShare !== null && (
          <View style={styles.costRow}>
            <AppText variant="LIST_SUBTITLE" color={Colors.TEXT_SECONDARY}>Per person ({uniqueParticipants.length})</AppText>
            <AppText variant="LIST_TITLE" color={Colors.TEXT_PRIMARY}>₹{perShare.toFixed(2)}</AppText>
          </View>
        )}
        <View style={styles.costRow}>
          <AppText variant="LIST_SUBTITLE" color={Colors.TEXT_SECONDARY}>Paid by</AppText>
          <AppText variant="LIST_TITLE" color={Colors.TEXT_PRIMARY}>{payer?.name ?? '—'}</AppText>
        </View>
      </View>

      {isOwner && (
        <>
          <AppButton
            label="Edit Cost & Payer"
            variant="secondary"
            onPress={() => navigation.navigate('CostEntry', { dayEntryId: dayEntry.id })}
            style={{ marginTop: Spacing.MD }}
          />

          <AppButton
            label={syncing ? 'Syncing...' : dayEntry.splitwise_synced ? 'Update Splitwise' : 'Sync to Splitwise'}
            onPress={handleSync}
            disabled={!canSync}
            loading={syncing}
            style={{ marginTop: Spacing.SM }}
          />

          {!canSync && dayEntry.total_cost !== null && (
            <AppText variant="CAPTION" color={Colors.TEXT_TERTIARY} style={styles.syncHint}>
              {!payer ? 'Set a payer to sync.' : 'Some participants are not linked to Splitwise. Go to Settings.'}
            </AppText>
          )}

          {dayEntry.splitwise_synced && (
            <>
              <Divider style={{ marginTop: Spacing.LG }} />
              <AppButton
                label="Remove from app"
                variant="ghost"
                onPress={handleRemoveFromApp}
                style={{ marginTop: Spacing.SM }}
              />
              <AppText variant="CAPTION" color={Colors.TEXT_TERTIARY} style={styles.syncHint}>
                Deletes local data only. Splitwise expense is kept.
              </AppText>
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BG },
  content: { padding: Spacing.LG, paddingBottom: Spacing.XXL },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.MD,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.SM,
    marginBottom: Spacing.MD,
  },
  waBtn: {
    backgroundColor: Colors.SUCCESS_MUTED,
    paddingHorizontal: Spacing.MD,
    paddingVertical: Spacing.XS + 2,
    borderRadius: 10,
  },
  editBtn: {
    backgroundColor: Colors.SURFACE,
    paddingHorizontal: Spacing.MD,
    paddingVertical: Spacing.XS + 2,
    borderRadius: 10,
  },
  sectionLabel: {
    marginTop: Spacing.MD,
    marginBottom: Spacing.SM,
  },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.SM,
  },
  mealLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  costSection: {
    backgroundColor: Colors.SURFACE,
    borderRadius: 12,
    padding: Spacing.MD,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.SM,
  },
  syncHint: {
    marginTop: Spacing.SM,
    textAlign: 'center',
  },
});
