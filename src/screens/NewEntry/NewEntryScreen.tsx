import React, { useEffect, useState } from 'react';
import {
  View, ScrollView, StyleSheet, TouchableOpacity, Alert, Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppText } from '../../components/ui/AppText';
import { AppButton } from '../../components/ui/AppButton';
import { Avatar } from '../../components/ui/Avatar';
import { Divider } from '../../components/ui/Divider';
import { DishPickerModal, DishSelection, selectionsToDescription } from '../../components/DishPickerModal';
import { Colors, Spacing, Radius } from '../../theme/tokens';
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
  selections: DishSelection[];
}

function isoFromDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function NewEntryScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();

  const initialDate = route.params?.date ?? todayISO();
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const [y, m, d] = initialDate.split('-').map(Number);
    return new Date(y, m - 1, d);
  });
  const [showPicker, setShowPicker] = useState(false);

  const [persons, setPersons] = useState<Person[]>([]);
  const [mealRows, setMealRows] = useState<MealRow[]>([{ personId: null, personName: '', selections: [] }]);
  const [showPersonPicker, setShowPersonPicker] = useState<number | null>(null);
  const [dishPickerRow, setDishPickerRow] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAllPersons().then(setPersons);
  }, []);

  function updateRow(index: number, fields: Partial<MealRow>) {
    setMealRows((rows) => rows.map((r, i) => (i === index ? { ...r, ...fields } : r)));
  }

  function addRow() {
    setMealRows((rows) => [...rows, { personId: null, personName: '', selections: [] }]);
  }

  function removeRow(index: number) {
    setMealRows((rows) => rows.filter((_, i) => i !== index));
  }

  async function handleSave() {
    const validRows = mealRows.filter((r) => r.personId && r.selections.length > 0);
    if (!validRows.length) {
      Alert.alert('Nothing to save', 'Please select a person and at least one dish for each entry.');
      return;
    }

    const dateISO = isoFromDate(selectedDate);
    setSaving(true);
    try {
      let dayEntry = await getDayEntryByDate(dateISO);
      if (!dayEntry) {
        dayEntry = await createDayEntry(dateISO);
      }
      await bulkCreateMealEntries(
        validRows.map((r) => ({
          dayEntryId: dayEntry!.id,
          personId: r.personId!,
          mealDescription: selectionsToDescription(r.selections),
          dishes: r.selections.map((s) => ({ dishId: s.dish.id, qty: s.qty })),
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
    <View style={styles.container}>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <AppText variant="SCREEN_TITLE" style={styles.heading}>New Day Entry</AppText>

      <TouchableOpacity style={styles.dateRow} onPress={() => setShowPicker(true)}>
        <AppText variant="LIST_SUBTITLE" color={Colors.TEXT_SECONDARY}>Date</AppText>
        <View style={styles.dateChip}>
          <AppText variant="LIST_TITLE" color={Colors.ACCENT_TEXT}>
            {formatDisplayDate(isoFromDate(selectedDate))}
          </AppText>
          <AppText variant="CAPTION" color={Colors.TEXT_TERTIARY} style={{ marginLeft: 6 }}>▾</AppText>
        </View>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_, date) => {
            setShowPicker(Platform.OS === 'ios');
            if (date) setSelectedDate(date);
          }}
          maximumDate={new Date(new Date().getFullYear() + 1, 11, 31)}
        />
      )}

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

          {/* Dish selections display */}
          {row.selections.length > 0 && (
            <View style={styles.chipsRow}>
              {row.selections.map((s) => (
                <View key={s.dish.id} style={styles.chip}>
                  <AppText variant="BADGE" color={Colors.ACCENT_TEXT}>
                    {s.dish.is_countable ? `${s.qty} ${s.dish.name}` : s.dish.name}
                  </AppText>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={[styles.addDishBtn, row.selections.length > 0 && styles.addDishBtnActive]}
            onPress={() => setDishPickerRow(i)}
          >
            <AppText variant="BADGE" color={row.selections.length > 0 ? Colors.ACCENT_TEXT : Colors.TEXT_TERTIARY}>
              {row.selections.length > 0 ? '✎ Edit dishes' : '+ Add dishes'}
            </AppText>
          </TouchableOpacity>

          {i < mealRows.length - 1 && <Divider style={{ marginTop: Spacing.MD }} />}
        </View>
      ))}

      <TouchableOpacity onPress={addRow} style={styles.addPersonBtn}>
        <AppText variant="BUTTON" color={Colors.ACCENT_TEXT}>+ Add another person</AppText>
      </TouchableOpacity>

      <AppButton label="Save Entry" onPress={handleSave} loading={saving} style={styles.saveBtn} />
    </ScrollView>

    <DishPickerModal
      visible={dishPickerRow !== null}
      initial={dishPickerRow !== null ? mealRows[dishPickerRow]?.selections ?? [] : []}
      onConfirm={(sels) => {
        if (dishPickerRow !== null) {
          updateRow(dishPickerRow, { selections: sels });
        }
        setDishPickerRow(null);
      }}
      onClose={() => setDishPickerRow(null)}
    />
    </View>
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
    paddingVertical: Spacing.XS,
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.SURFACE,
    paddingHorizontal: Spacing.MD,
    paddingVertical: Spacing.XS + 2,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  mealRow: { marginTop: Spacing.MD },
  mealRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.XS,
  },
  personSelector: { paddingVertical: Spacing.XS },
  personChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.SURFACE,
    paddingHorizontal: Spacing.SM,
    paddingVertical: Spacing.XS,
    borderRadius: 20,
  },
  personList: {
    backgroundColor: Colors.WHITE,
    borderRadius: 12,
    marginTop: Spacing.XS,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    shadowColor: '#1A2634',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  personOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.SM + 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.BORDER,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.XS,
    marginTop: Spacing.SM,
  },
  chip: {
    backgroundColor: Colors.ACCENT_MUTED,
    borderRadius: Radius.PILL,
    paddingHorizontal: Spacing.SM,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Colors.ACCENT,
  },
  addDishBtn: {
    marginTop: Spacing.SM,
    paddingVertical: Spacing.SM,
    paddingHorizontal: Spacing.MD,
    borderRadius: Radius.INPUT,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  addDishBtnActive: {
    borderColor: Colors.ACCENT,
    borderStyle: 'solid',
    backgroundColor: Colors.ACCENT_MUTED,
  },
  addPersonBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.MD,
    marginTop: Spacing.SM,
  },
  saveBtn: { marginTop: Spacing.LG },
});
