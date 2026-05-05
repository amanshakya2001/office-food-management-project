import React, { useEffect, useState } from 'react';
import {
  Modal, View, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator,
} from 'react-native';
import { AppText } from './ui/AppText';
import { Colors, Spacing, Radius } from '../theme/tokens';
import { getDishes, Dish } from '../db/repositories/dishRepository';

export interface DishSelection {
  dish: Dish;
  qty: number;
}

interface Props {
  visible: boolean;
  initial: DishSelection[];
  onConfirm: (selections: DishSelection[]) => void;
  onClose: () => void;
}

export function DishPickerModal({ visible, initial, onConfirm, onClose }: Props) {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selections, setSelections] = useState<Map<number, DishSelection>>(new Map());

  useEffect(() => {
    if (visible) {
      setLoading(true);
      setError(null);
      getDishes()
        .then(setDishes)
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
      const map = new Map<number, DishSelection>();
      initial.forEach((s) => map.set(s.dish.id, s));
      setSelections(map);
      setSearch('');
    }
  }, [visible]);

  const filtered = dishes.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  function toggle(dish: Dish) {
    setSelections((prev) => {
      const next = new Map(prev);
      if (next.has(dish.id)) {
        next.delete(dish.id);
      } else {
        next.set(dish.id, { dish, qty: 1 });
      }
      return next;
    });
  }

  function changeQty(dish: Dish, delta: number) {
    setSelections((prev) => {
      const next = new Map(prev);
      const cur = next.get(dish.id);
      if (!cur) return next;
      const newQty = Math.max(1, cur.qty + delta);
      next.set(dish.id, { ...cur, qty: newQty });
      return next;
    });
  }

  function handleConfirm() {
    onConfirm(Array.from(selections.values()));
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <AppText variant="LIST_TITLE">Select Dishes</AppText>
            <TouchableOpacity onPress={onClose}>
              <AppText variant="CAPTION" color={Colors.TEXT_TERTIARY}>Cancel</AppText>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.search}
            placeholder="Search dishes..."
            placeholderTextColor={Colors.TEXT_TERTIARY}
            value={search}
            onChangeText={setSearch}
          />

          {loading ? (
            <ActivityIndicator color={Colors.ACCENT} style={{ marginTop: Spacing.LG }} />
          ) : error ? (
            <AppText variant="CAPTION" color={Colors.ERROR_TEXT} style={styles.empty}>
              Failed to load dishes: {error}
            </AppText>
          ) : filtered.length === 0 ? (
            <AppText variant="CAPTION" color={Colors.TEXT_TERTIARY} style={styles.empty}>
              {dishes.length === 0 ? 'No dishes yet. Ask admin to add dishes.' : 'No matches.'}
            </AppText>
          ) : (
            <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
              {filtered.map((dish) => {
                const sel = selections.get(dish.id);
                const selected = !!sel;
                return (
                  <View key={dish.id} style={[styles.row, selected && styles.rowSelected]}>
                    <TouchableOpacity style={styles.rowLeft} onPress={() => toggle(dish)}>
                      <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                        {selected && <AppText variant="CAPTION" color={Colors.BG}>✓</AppText>}
                      </View>
                      <AppText
                        variant="LIST_SUBTITLE"
                        color={selected ? Colors.TEXT_PRIMARY : Colors.TEXT_SECONDARY}
                        style={{ flex: 1 }}
                      >
                        {dish.name}
                      </AppText>
                    </TouchableOpacity>

                    {selected && dish.is_countable && (
                      <View style={styles.stepper}>
                        <TouchableOpacity style={styles.stepBtn} onPress={() => changeQty(dish, -1)}>
                          <AppText variant="LIST_TITLE" color={Colors.ACCENT_TEXT}>−</AppText>
                        </TouchableOpacity>
                        <AppText variant="LIST_TITLE" color={Colors.TEXT_PRIMARY} style={styles.qty}>
                          {sel!.qty}
                        </AppText>
                        <TouchableOpacity style={styles.stepBtn} onPress={() => changeQty(dish, 1)}>
                          <AppText variant="LIST_TITLE" color={Colors.ACCENT_TEXT}>+</AppText>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          )}

          <TouchableOpacity
            style={[styles.confirmBtn, selections.size === 0 && styles.confirmBtnDisabled]}
            onPress={handleConfirm}
            disabled={selections.size === 0}
          >
            <AppText variant="BUTTON" color={selections.size > 0 ? Colors.BG : Colors.TEXT_TERTIARY}>
              {selections.size === 0 ? 'Select at least one dish' : `Confirm (${selections.size} dish${selections.size > 1 ? 'es' : ''})`}
            </AppText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export function selectionsToDescription(selections: DishSelection[]): string {
  return selections
    .map((s) => (s.dish.is_countable ? `${s.qty} ${s.dish.name}` : s.dish.name))
    .join(' + ');
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(26,38,52,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.WHITE,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: Spacing.MD,
    paddingBottom: Spacing.XXL,
    height: '80%',
    shadowColor: '#1A2634',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.LG,
    paddingBottom: Spacing.MD,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER,
  },
  search: {
    marginHorizontal: Spacing.LG,
    marginTop: Spacing.SM,
    marginBottom: Spacing.XS,
    backgroundColor: Colors.BG,
    borderRadius: Radius.INPUT,
    paddingHorizontal: Spacing.MD,
    paddingVertical: Spacing.SM + 2,
    color: Colors.TEXT_PRIMARY,
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    borderWidth: 1.5,
    borderColor: Colors.BORDER,
  },
  list: { flex: 1 },
  empty: {
    textAlign: 'center',
    marginTop: Spacing.LG,
    paddingHorizontal: Spacing.LG,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.LG,
    paddingVertical: Spacing.MD,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER_LIGHT,
  },
  rowSelected: {
    backgroundColor: Colors.ACCENT_MUTED,
  },
  rowLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.SM,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.WHITE,
  },
  checkboxSelected: {
    backgroundColor: Colors.ACCENT,
    borderColor: Colors.ACCENT,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.SM,
  },
  stepBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.ACCENT_MUTED,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.ACCENT,
  },
  qty: {
    minWidth: 22,
    textAlign: 'center',
  },
  confirmBtn: {
    marginHorizontal: Spacing.LG,
    marginTop: Spacing.MD,
    backgroundColor: Colors.ACCENT,
    borderRadius: Radius.BUTTON,
    paddingVertical: Spacing.MD,
    alignItems: 'center',
  },
  confirmBtnDisabled: {
    backgroundColor: Colors.BG,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
});
