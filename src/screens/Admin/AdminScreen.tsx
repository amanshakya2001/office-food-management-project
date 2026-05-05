import React, { useEffect, useState, useCallback } from 'react';
import {
  View, ScrollView, StyleSheet, TouchableOpacity, Alert, Modal, TextInput, Switch, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../../components/ui/AppText';
import { AppButton } from '../../components/ui/AppButton';
import { Divider } from '../../components/ui/Divider';
import { Colors, Spacing, Radius } from '../../theme/tokens';
import { getDishes, createDish, updateDish, deleteDish, Dish } from '../../db/repositories/dishRepository';

export function AdminScreen() {
  const insets = useSafeAreaInsets();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Dish | null>(null);
  const [name, setName] = useState('');
  const [isCountable, setIsCountable] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    getDishes()
      .then(setDishes)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  function openAdd() {
    setEditing(null);
    setName('');
    setIsCountable(false);
    setModalVisible(true);
  }

  function openEdit(dish: Dish) {
    setEditing(dish);
    setName(dish.name);
    setIsCountable(dish.is_countable);
    setModalVisible(true);
  }

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert('Required', 'Dish name cannot be empty.');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await updateDish(editing.id, name, isCountable);
      } else {
        await createDish(name, isCountable);
      }
      setModalVisible(false);
      load();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete(dish: Dish) {
    Alert.alert(
      'Delete dish',
      `Remove "${dish.name}" from the list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDish(dish.id);
              load();
            } catch (e: any) {
              Alert.alert('Error', e.message);
            }
          },
        },
      ]
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.MD }]}>
      <View style={styles.headerRow}>
        <AppText variant="SCREEN_TITLE">Dishes</AppText>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <AppText variant="BUTTON" color={Colors.WHITE}>+ Add</AppText>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.ACCENT} style={{ marginTop: Spacing.LG }} />
      ) : dishes.length === 0 ? (
        <View style={styles.empty}>
          <AppText variant="BODY" color={Colors.TEXT_TERTIARY} style={{ textAlign: 'center' }}>
            No dishes yet. Tap "+ Add" to create the first one.
          </AppText>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {dishes.map((dish, i) => (
            <View key={dish.id}>
              <View style={styles.row}>
                <View style={styles.rowInfo}>
                  <AppText variant="LIST_TITLE">{dish.name}</AppText>
                  <AppText variant="CAPTION" color={Colors.TEXT_TERTIARY}>
                    {dish.is_countable ? 'Countable (qty)' : 'Non-countable'}
                  </AppText>
                </View>
                <View style={styles.rowActions}>
                  <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(dish)}>
                    <AppText variant="CAPTION" color={Colors.ACCENT_TEXT}>Edit</AppText>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => confirmDelete(dish)}>
                    <AppText variant="CAPTION" color={Colors.ERROR_TEXT}>Delete</AppText>
                  </TouchableOpacity>
                </View>
              </View>
              {i < dishes.length - 1 && <Divider />}
            </View>
          ))}
        </ScrollView>
      )}

      {/* Add / Edit modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <AppText variant="LIST_TITLE" style={{ marginBottom: Spacing.MD }}>
              {editing ? 'Edit Dish' : 'New Dish'}
            </AppText>

            <AppText variant="CAPTION" color={Colors.TEXT_SECONDARY} style={styles.label}>Dish name</AppText>
            <TextInput
              style={styles.input}
              placeholder="e.g. Roti, Paneer sabzi…"
              placeholderTextColor={Colors.TEXT_TERTIARY}
              value={name}
              onChangeText={setName}
              autoFocus
            />

            <View style={styles.switchRow}>
              <View>
                <AppText variant="LIST_SUBTITLE">Countable</AppText>
                <AppText variant="CAPTION" color={Colors.TEXT_TERTIARY}>
                  e.g. roti (3 roti), raita (1 raita)
                </AppText>
              </View>
              <Switch
                value={isCountable}
                onValueChange={setIsCountable}
                trackColor={{ true: Colors.ACCENT, false: Colors.BORDER }}
                thumbColor={Colors.TEXT_PRIMARY}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <AppText variant="BUTTON" color={Colors.TEXT_SECONDARY}>Cancel</AppText>
              </TouchableOpacity>
              <AppButton
                label={editing ? 'Save' : 'Add Dish'}
                onPress={handleSave}
                loading={saving}
                style={styles.saveBtn}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BG },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.LG,
    marginBottom: Spacing.MD,
  },
  addBtn: {
    backgroundColor: Colors.ACCENT,
    paddingHorizontal: Spacing.MD,
    paddingVertical: Spacing.XS + 2,
    borderRadius: Radius.PILL,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.LG,
  },
  list: { paddingBottom: Spacing.XXL },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.MD,
    paddingHorizontal: Spacing.LG,
    backgroundColor: Colors.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER_LIGHT,
  },
  rowInfo: { flex: 1, gap: 2 },
  rowActions: {
    flexDirection: 'row',
    gap: Spacing.MD,
  },
  editBtn: {
    paddingHorizontal: Spacing.SM,
    paddingVertical: Spacing.XS,
  },
  deleteBtn: {
    paddingHorizontal: Spacing.SM,
    paddingVertical: Spacing.XS,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(26,38,52,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.WHITE,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.LG,
    paddingBottom: Spacing.XXL,
    shadowColor: '#1A2634',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
  },
  label: { marginBottom: Spacing.XS },
  input: {
    backgroundColor: Colors.BG,
    borderRadius: Radius.INPUT,
    paddingHorizontal: Spacing.MD,
    paddingVertical: Spacing.SM + 2,
    color: Colors.TEXT_PRIMARY,
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    borderWidth: 1.5,
    borderColor: Colors.BORDER,
    marginBottom: Spacing.MD,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.MD,
    borderTopWidth: 1,
    borderTopColor: Colors.BORDER,
    marginBottom: Spacing.MD,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.SM,
    alignItems: 'center',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: Spacing.MD,
    alignItems: 'center',
    borderRadius: Radius.BUTTON,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  saveBtn: { flex: 2 },
});
