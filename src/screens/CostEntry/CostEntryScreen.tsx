import React, { useCallback, useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useFocusEffect, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppText } from '../../components/ui/AppText';
import { AppInput } from '../../components/ui/AppInput';
import { AppButton } from '../../components/ui/AppButton';
import { Avatar } from '../../components/ui/Avatar';
import { Divider } from '../../components/ui/Divider';
import { Colors, Spacing } from '../../theme/tokens';
import { getDayEntryById, updateDayEntry } from '../../db/repositories/dayEntryRepository';
import { getMealEntriesByDayEntry } from '../../db/repositories/mealEntryRepository';
import { getAllPersons } from '../../db/repositories/personRepository';
import { DayEntry, MealEntry, Person } from '../../types/models';
import { HomeStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'CostEntry'>;
type Route = RouteProp<HomeStackParamList, 'CostEntry'>;

export function CostEntryScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { dayEntryId } = route.params;

  const [dayEntry, setDayEntry] = useState<DayEntry | null>(null);
  const [meals, setMeals] = useState<(MealEntry & { person: Person })[]>([]);
  const [allPersons, setAllPersons] = useState<Person[]>([]);
  const [costText, setCostText] = useState('');
  const [payerId, setPayerId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const entry = await getDayEntryById(dayEntryId);
    if (!entry) return;
    setDayEntry(entry);
    if (entry.total_cost !== null) setCostText(String(entry.total_cost));
    if (entry.paid_by_person_id) setPayerId(entry.paid_by_person_id);
    const mealList = await getMealEntriesByDayEntry(dayEntryId);
    setMeals(mealList);
    const persons = await getAllPersons();
    setAllPersons(persons);
  }, [dayEntryId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const uniqueParticipants = meals.filter(
    (m, i, arr) => arr.findIndex((x) => x.person_id === m.person_id) === i
  ).map((m) => m.person);

  const participantIds = new Set(uniqueParticipants.map((p) => p.id));

  const totalCost = parseFloat(costText) || 0;
  const perShare = uniqueParticipants.length > 0 ? totalCost / uniqueParticipants.length : 0;

  async function handleSave() {
    const cost = parseFloat(costText);
    if (isNaN(cost) || cost <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid cost.');
      return;
    }
    if (!payerId) {
      Alert.alert('No payer', 'Please select who paid the bill.');
      return;
    }
    setSaving(true);
    try {
      await updateDayEntry(dayEntryId, {
        total_cost: cost,
        paid_by_person_id: payerId,
        splitwise_synced: false,
      });
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <AppText variant="SCREEN_TITLE" style={styles.heading}>Cost & Payer</AppText>

        <AppInput
          label="Total cost (₹)"
          placeholder="0.00"
          value={costText}
          onChangeText={setCostText}
          keyboardType="decimal-pad"
        />

        {totalCost > 0 && uniqueParticipants.length > 0 && (
          <View style={styles.splitPreview}>
            <AppText variant="LIST_SUBTITLE" color={Colors.TEXT_SECONDARY}>
              Per person ({uniqueParticipants.length} people)
            </AppText>
            <AppText variant="HERO_NUMBER" color={Colors.ACCENT_TEXT}>₹{perShare.toFixed(2)}</AppText>
          </View>
        )}

        <Divider style={{ marginVertical: Spacing.MD }} />

        <AppText variant="SECTION_HEADER" color={Colors.TEXT_TERTIARY} style={styles.sectionLabel}>
          WHO PAID?
        </AppText>

        {allPersons.map((person) => (
          <TouchableOpacity
            key={person.id}
            style={styles.payerRow}
            onPress={() => setPayerId(person.id)}
          >
            <View style={styles.payerLeft}>
              <Avatar name={person.name} size="MD" />
              <View style={{ marginLeft: Spacing.SM }}>
                <AppText variant="LIST_TITLE">{person.name}</AppText>
                {!participantIds.has(person.id) && (
                  <AppText variant="CAPTION" color={Colors.TEXT_TERTIARY}>not in meals</AppText>
                )}
              </View>
            </View>
            <View style={[styles.radio, payerId === person.id && styles.radioSelected]}>
              {payerId === person.id && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>
        ))}

        <AppButton label="Save" onPress={handleSave} loading={saving} style={styles.saveBtn} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BG },
  content: { padding: Spacing.LG, paddingBottom: Spacing.XXL },
  heading: { marginBottom: Spacing.LG },
  splitPreview: {
    backgroundColor: Colors.ACCENT_MUTED,
    borderRadius: 12,
    padding: Spacing.MD,
    marginTop: Spacing.MD,
    alignItems: 'center',
  },
  sectionLabel: { marginBottom: Spacing.SM },
  payerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.SM + 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.BORDER,
  },
  payerLeft: { flexDirection: 'row', alignItems: 'center' },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.BORDER_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: Colors.ACCENT },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.ACCENT },
  saveBtn: { marginTop: Spacing.XL },
});
