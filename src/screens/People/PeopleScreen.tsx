import React, { useCallback, useState } from 'react';
import {
  View, FlatList, StyleSheet, TouchableOpacity, Modal, Alert, KeyboardAvoidingView,
  Platform, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { AppText } from '../../components/ui/AppText';
import { AppInput } from '../../components/ui/AppInput';
import { AppButton } from '../../components/ui/AppButton';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Divider } from '../../components/ui/Divider';
import { EmptyState } from '../../components/ui/EmptyState';
import { Colors, Spacing } from '../../theme/tokens';
import { getAllPersons, createPerson, updatePerson, deletePerson } from '../../db/repositories/personRepository';
import { useOwner } from '../../context/OwnerContext';
import { Person } from '../../types/models';

export function PeopleScreen() {
  const insets = useSafeAreaInsets();
  const { isOwner } = useOwner();
  const [persons, setPersons] = useState<Person[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editTarget, setEditTarget] = useState<Person | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState('');

  const load = useCallback(async () => {
    const all = await getAllPersons();
    setPersons(all);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  function openAdd() {
    setEditTarget(null);
    setName('');
    setPhone('');
    setNameError('');
    setModalVisible(true);
  }

  function openEdit(person: Person) {
    if (!isOwner) return;
    setEditTarget(person);
    setName(person.name);
    setPhone(person.phone_number);
    setNameError('');
    setModalVisible(true);
  }

  async function handleSave() {
    if (!name.trim()) { setNameError('Name is required'); return; }
    setSaving(true);
    try {
      if (editTarget) {
        await updatePerson(editTarget.id, { name: name.trim(), phone_number: phone.trim() });
      } else {
        await createPerson(name.trim(), phone.trim());
      }
      setModalVisible(false);
      await load();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!editTarget) return;
    Alert.alert(
      'Delete person?',
      `Remove ${editTarget.name}? This will also remove all their meal entries.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deletePerson(editTarget.id);
            setModalVisible(false);
            await load();
          },
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.SM }]}>
        <AppText variant="SCREEN_TITLE">People</AppText>
        {isOwner && (
          <TouchableOpacity onPress={openAdd} style={styles.addBtn}>
            <AppText variant="BUTTON" color={Colors.BG}>+ Add</AppText>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={persons}
        keyExtractor={(p) => String(p.id)}
        ItemSeparatorComponent={Divider}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.personRow}
            onPress={() => openEdit(item)}
            activeOpacity={isOwner ? 0.7 : 1}
          >
            <Avatar name={item.name} size="MD" />
            <View style={styles.personInfo}>
              <AppText variant="LIST_TITLE">{item.name}</AppText>
              <AppText variant="PHONE" color={Colors.TEXT_SECONDARY}>{item.phone_number}</AppText>
            </View>
            {item.splitwise_user_id ? (
              <Badge label="SW Linked" variant="info" />
            ) : (
              <Badge label="Not Linked" variant="error" />
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <EmptyState
            title="No people yet"
            subtitle={isOwner ? 'Add the people who share food orders' : 'No people added yet'}
          />
        }
      />

      {isOwner && (
        <Modal visible={modalVisible} animationType="slide" transparent>
          <KeyboardAvoidingView
            style={styles.modalOverlay}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <AppText variant="LIST_TITLE">{editTarget ? 'Edit Person' : 'Add Person'}</AppText>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <AppText variant="BODY" color={Colors.TEXT_TERTIARY}>✕</AppText>
                </TouchableOpacity>
              </View>
              <ScrollView keyboardShouldPersistTaps="handled">
                <AppInput
                  label="Name"
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChangeText={(t) => { setName(t); setNameError(''); }}
                  error={nameError}
                  style={{ marginBottom: Spacing.MD }}
                />
                <AppInput
                  label="Phone number"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  mono
                  style={{ marginBottom: Spacing.LG }}
                />
                <AppButton label="Save" onPress={handleSave} loading={saving} />
                {editTarget && (
                  <AppButton
                    label="Delete person"
                    variant="ghost"
                    onPress={handleDelete}
                    style={{ marginTop: Spacing.SM }}
                  />
                )}
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      )}
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
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.LG,
    paddingVertical: Spacing.MD,
  },
  personInfo: { flex: 1, marginLeft: Spacing.MD },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalSheet: {
    backgroundColor: Colors.SURFACE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.LG,
    paddingBottom: Spacing.XXL,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.LG,
  },
});
