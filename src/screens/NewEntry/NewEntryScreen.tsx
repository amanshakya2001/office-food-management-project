import React, { useEffect, useState } from 'react';
import {
  View, ScrollView, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppText } from '../../components/ui/AppText';
import { AppInput } from '../../components/ui/AppInput';
import { AppButton } from '../../components/ui/AppButton';
import { Avatar } from '../../components/ui/Avatar';
import { Divider } from '../../components/ui/Divider';
import { Colors, Spacing } from '../../theme/tokens';
import { getAllPersons } from '../../db/repositories/personRepository';
import { createDayEntry, getDayEntryByDate } from '../../db/repositories/dayEntryRepository';
import { bulkCreateMealEntries } from '../../db/repositories/mealEntryRepository';
import { Person } from '../../types/models';
import { todayISO, formatDisplayDate } from '../../services/dateUtils';
import { HomeStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'NewEntry'>;
type Route = RouteProp<HomeStackParamList, 'NewEntry'>;

interface MealRow {
  personId: number | null;
  personName: string;
  description: string;
}

export function NewEntryScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const [date, setDate] = useState(route.params?.date ?? todayISO());
  const [persons, setPersons] = useState<Person[]>([]);
  const [mealRows, setMealRows] = useState<MealRow[]>([{ personId: null, personName: '', description: '' }]);
  const [showPersonPicker, setShowPersonPicker] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAllPersons().then(setPersons);
  }, []);

  function updateRow(index: number, fields: Partial<MealRow>) {
    setMealRows((rows) => rows.map((r, i) => (i === index ? { ...r, ...fields } : r)));
  }

  function addRow() {
    setMealRows((rows) => [...rows, { personId: null, personName: '', description: '' }]);
  }

  function removeRow(index: number) {
    setMealRows((rows) => rows.filter((_, i) => i !== index));
  }

  async function handleSave() {
    const validRows = mealRows.filter((r) => r.personId && r.description.trim());
    if (!validRows.length) {
      Alert.alert('Nothing to save', 'Please add at least one meal entry with a person and description.');
      return;
    }

    setSaving(true);
    try {
      let dayEntry = await getDayEntryByDate(date);
      if (!dayEntry) {
        dayEntry = await createDayEntry(date);
      }
      await bulkCreateMealEntries(
        validRows.map((r) => ({
          dayEntryId: dayEntry!.id,
          personId: r.personId!,
          mealDescription: r.description.trim(),
        }))
      );
      navigation.replace('DayDetail', { dayEntryId: dayEntry.id });
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <AppText variant="SCREEN_TITLE" style={styles.heading}>New Day Entry</AppText>

        <View style={styles.dateRow}>
          <AppText variant="LIST_SUBTITLE" color={Colors.TEXT_SECONDARY}>Date</AppText>
          <AppText variant="LIST_TITLE" color={Colors.ACCENT_TEXT}>{formatDisplayDate(date)}</AppText>
        </View>

        <Divider />

        {mealRows.map((row, i) => (
          <View key={i} style={styles.mealRow}>
            <View style={styles.mealRowHeader}>
              <TouchableOpacity
                style={styles.personSelector}
                onPress={() => setShowPersonPicker(showPersonPicker === i ? null : i)}
              >
                {row.personId ? (
                  <View style={styles.personChip}>
                    <Avatar name={row.personName} size="XS" />
                    <AppText variant="BADGE" color={Colors.TEXT_PRIMARY} style={{ marginLeft: 6 }}>
                      {row.personName}
                    </AppText>
                  </View>
                ) : (
                  <AppText variant="BADGE" color={Colors.TEXT_TERTIARY}>Select person ▾</AppText>
                )}
              </TouchableOpacity>
              {mealRows.length > 1 && (
                <TouchableOpacity onPress={() => removeRow(i)}>
                  <AppText variant="CAPTION" color={Colors.ERROR_TEXT}>Remove</AppText>
                </TouchableOpacity>
              )}
            </View>

            {showPersonPicker === i && (
              <View style={styles.personList}>
                {persons.length === 0 ? (
                  <AppText variant="CAPTION" color={Colors.TEXT_TERTIARY} style={{ padding: Spacing.SM }}>
                    No people yet. Add people in the People tab first.
                  </AppText>
                ) : (
                  persons.map((p) => (
                    <TouchableOpacity
                      key={p.id}
                      style={styles.personOption}
                      onPress={() => {
                        updateRow(i, { personId: p.id, personName: p.name });
                        setShowPersonPicker(null);
                      }}
                    >
                      <Avatar name={p.name} size="SM" />
                      <AppText variant="LIST_SUBTITLE" style={{ marginLeft: Spacing.SM }}>{p.name}</AppText>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}

            <AppInput
              mono
              placeholder="Meal description (e.g. 4 roti + dal)"
              value={row.description}
              onChangeText={(t) => updateRow(i, { description: t })}
              style={{ marginTop: Spacing.SM }}
            />

            {i < mealRows.length - 1 && <Divider style={{ marginTop: Spacing.MD }} />}
          </View>
        ))}

        <TouchableOpacity onPress={addRow} style={styles.addPersonBtn}>
          <AppText variant="BUTTON" color={Colors.ACCENT_TEXT}>+ Add another person</AppText>
        </TouchableOpacity>

        <AppButton label="Save Entry" onPress={handleSave} loading={saving} style={styles.saveBtn} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BG },
  content: { padding: Spacing.LG, paddingBottom: Spacing.XXL },
  heading: { marginBottom: Spacing.LG },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.MD,
  },
  mealRow: { marginTop: Spacing.MD },
  mealRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.XS,
  },
  personSelector: {
    paddingVertical: Spacing.XS,
  },
  personChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.SURFACE,
    paddingHorizontal: Spacing.SM,
    paddingVertical: Spacing.XS,
    borderRadius: 20,
  },
  personList: {
    backgroundColor: Colors.SURFACE,
    borderRadius: 10,
    marginTop: Spacing.XS,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  personOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.SM + 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.BORDER,
  },
  addPersonBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.MD,
    marginTop: Spacing.SM,
  },
  saveBtn: { marginTop: Spacing.LG },
});
