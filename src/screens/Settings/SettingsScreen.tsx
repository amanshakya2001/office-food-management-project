import React, { useCallback, useEffect, useState } from 'react';
import {
  View, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { AppText } from '../../components/ui/AppText';
import { AppButton } from '../../components/ui/AppButton';
import { AppInput } from '../../components/ui/AppInput';
import { Badge } from '../../components/ui/Badge';
import { Divider } from '../../components/ui/Divider';
import { Colors, Spacing } from '../../theme/tokens';
import { getAllPersons, updatePerson } from '../../db/repositories/personRepository';
import {
  getToken, saveToken, clearToken,
  getSavedGroupId, saveGroupId, clearGroupId,
  getCurrentUser, getGroups, getGroup,
} from '../../services/splitwiseService';
import { useOwner } from '../../context/OwnerContext';
import { Person } from '../../types/models';
import Constants from 'expo-constants';

WebBrowser.maybeCompleteAuthSession();

const SPLITWISE_CLIENT_ID = (Constants.expoConfig?.extra?.splitwiseClientId as string) ?? '';
const SPLITWISE_CLIENT_SECRET = (Constants.expoConfig?.extra?.splitwiseClientSecret as string) ?? '';
const REDIRECT_URI = 'officefood://redirect';

export function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { isOwner, claimOwnership, revokeOwnership, loaded } = useOwner();

  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [claimingOwner, setClaimingOwner] = useState(false);

  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groupMembers, setGroupMembers] = useState<any[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);

  const [, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: SPLITWISE_CLIENT_ID,
      redirectUri: REDIRECT_URI,
      responseType: AuthSession.ResponseType.Code,
      usePKCE: false,
      scopes: [],
    },
    { authorizationEndpoint: 'https://secure.splitwise.com/oauth/authorize' }
  );

  const load = useCallback(async () => {
    const t = await getToken();
    setToken(t);
    const gid = await getSavedGroupId();
    setSelectedGroupId(gid);
    const all = await getAllPersons();
    setPersons(all);

    if (t) {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch {}
    }
    if (t && gid) {
      try {
        const group = await getGroup(gid);
        setGroupMembers(group.members ?? []);
      } catch {}
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  useEffect(() => {
    if (response?.type === 'success') {
      handleAuthCode(response.params.code);
    }
  }, [response]);

  async function handleClaimOwnership() {
    setClaimingOwner(true);
    setPinError('');
    const ok = await claimOwnership(pinInput.trim());
    setClaimingOwner(false);
    if (ok) {
      setPinInput('');
    } else {
      setPinError('Incorrect PIN. Try again.');
    }
  }

  async function handleRevokeOwnership() {
    Alert.alert(
      'Remove owner access?',
      'You will lose write access on this device. To get it back, enter the PIN again.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => revokeOwnership() },
      ]
    );
  }

  async function handleAuthCode(code: string) {
    setLoadingAuth(true);
    try {
      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: SPLITWISE_CLIENT_ID,
        client_secret: SPLITWISE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        code,
      }).toString();

      const res = await fetch('https://secure.splitwise.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
      const data = await res.json();
      if (data.access_token) {
        await saveToken(data.access_token);
        await load();
      } else {
        Alert.alert('Auth failed', `Error: ${data.error}`);
      }
    } catch (e: any) {
      Alert.alert('Auth error', e.message);
    } finally {
      setLoadingAuth(false);
    }
  }

  async function handleDisconnect() {
    Alert.alert('Disconnect Splitwise?', 'This will clear your token and group selection.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Disconnect',
        style: 'destructive',
        onPress: async () => {
          await clearToken();
          await clearGroupId();
          for (const p of persons) {
            await updatePerson(p.id, { splitwise_user_id: null, splitwise_user_name: null });
          }
          setToken(null);
          setCurrentUser(null);
          setGroups([]);
          setSelectedGroupId(null);
          setGroupMembers([]);
          await load();
        },
      },
    ]);
  }

  async function handleLoadGroups() {
    setLoadingGroups(true);
    try {
      const g = await getGroups();
      setGroups(g.filter((x: any) => x.id !== 0));
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoadingGroups(false);
    }
  }

  async function handleSelectGroup(gid: string) {
    await saveGroupId(gid);
    setSelectedGroupId(gid);
    try {
      const group = await getGroup(gid);
      setGroupMembers(group.members ?? []);
    } catch {}
  }

  async function handleMapPerson(person: Person, swUserId: string, swUserName: string) {
    await updatePerson(person.id, { splitwise_user_id: swUserId, splitwise_user_name: swUserName });
    await load();
  }

  async function handleUnmapPerson(person: Person) {
    await updatePerson(person.id, { splitwise_user_id: null, splitwise_user_name: null });
    await load();
  }

  if (!loaded) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={Colors.ACCENT} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.LG }]}
        keyboardShouldPersistTaps="handled"
      >
        <AppText variant="SCREEN_TITLE" style={styles.heading}>Settings</AppText>

        {/* Owner access section */}
        <AppText variant="SECTION_HEADER" color={Colors.TEXT_TERTIARY} style={styles.sectionLabel}>
          OWNER ACCESS
        </AppText>
        <View style={styles.card}>
          {isOwner ? (
            <>
              <View style={styles.row}>
                <AppText variant="LIST_TITLE" color={Colors.SUCCESS_TEXT}>Owner on this device</AppText>
                <Badge label="Active" variant="success" />
              </View>
              <AppText variant="LIST_SUBTITLE" color={Colors.TEXT_SECONDARY} style={{ marginTop: Spacing.XS }}>
                You can add/edit entries, manage people, and use Splitwise.
              </AppText>
              <AppButton
                label="Remove owner access"
                variant="ghost"
                onPress={handleRevokeOwnership}
                style={{ marginTop: Spacing.MD }}
              />
            </>
          ) : (
            <>
              <AppText variant="LIST_SUBTITLE" color={Colors.TEXT_SECONDARY} style={{ marginBottom: Spacing.MD }}>
                Enter the owner PIN to get write access on this device.
              </AppText>
              <AppInput
                label="Owner PIN"
                placeholder="Enter PIN"
                value={pinInput}
                onChangeText={(t) => { setPinInput(t); setPinError(''); }}
                secureTextEntry
                keyboardType="number-pad"
                error={pinError}
                style={{ marginBottom: Spacing.MD }}
              />
              <AppButton
                label="Claim ownership"
                onPress={handleClaimOwnership}
                loading={claimingOwner}
              />
            </>
          )}
        </View>

        {/* Splitwise — only shown to owner */}
        {isOwner && (
          <>
            <AppText variant="SECTION_HEADER" color={Colors.TEXT_TERTIARY} style={styles.sectionLabel}>
              SPLITWISE ACCOUNT
            </AppText>
            <View style={styles.card}>
              {token ? (
                <>
                  <View style={styles.row}>
                    <AppText variant="LIST_TITLE" color={Colors.SUCCESS_TEXT}>
                      {currentUser ? `Connected as ${currentUser.first_name}` : 'Connected'}
                    </AppText>
                    <Badge label="Active" variant="success" />
                  </View>
                  <AppButton
                    label="Disconnect"
                    variant="secondary"
                    onPress={handleDisconnect}
                    style={{ marginTop: Spacing.MD }}
                  />
                </>
              ) : (
                <>
                  <AppText variant="LIST_SUBTITLE" color={Colors.TEXT_SECONDARY} style={{ marginBottom: Spacing.MD }}>
                    Connect your Splitwise account to sync expenses automatically.
                  </AppText>
                  <AppButton
                    label={loadingAuth ? 'Connecting...' : 'Connect Splitwise'}
                    onPress={() => promptAsync()}
                    loading={loadingAuth}
                  />
                </>
              )}
            </View>

            {token && (
              <>
                <AppText variant="SECTION_HEADER" color={Colors.TEXT_TERTIARY} style={styles.sectionLabel}>
                  GROUP
                </AppText>
                <View style={styles.card}>
                  {selectedGroupId ? (
                    <View style={styles.row}>
                      <AppText variant="LIST_SUBTITLE" color={Colors.TEXT_SECONDARY}>Active group ID</AppText>
                      <AppText variant="LIST_TITLE">{selectedGroupId}</AppText>
                    </View>
                  ) : (
                    <AppText variant="LIST_SUBTITLE" color={Colors.TEXT_SECONDARY} style={{ marginBottom: Spacing.MD }}>
                      Select a Splitwise group to split expenses into.
                    </AppText>
                  )}
                  <AppButton
                    label={loadingGroups ? 'Loading...' : 'Load My Groups'}
                    variant="secondary"
                    onPress={handleLoadGroups}
                    loading={loadingGroups}
                    style={{ marginTop: Spacing.SM }}
                  />
                  {groups.map((g) => (
                    <TouchableOpacity
                      key={g.id}
                      style={[styles.groupRow, selectedGroupId === String(g.id) && styles.groupRowSelected]}
                      onPress={() => handleSelectGroup(String(g.id))}
                    >
                      <AppText variant="LIST_TITLE">{g.name}</AppText>
                      {selectedGroupId === String(g.id) && (
                        <AppText variant="BADGE" color={Colors.ACCENT_TEXT}>✓</AppText>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>

                <AppText variant="SECTION_HEADER" color={Colors.TEXT_TERTIARY} style={styles.sectionLabel}>
                  PERSON → SPLITWISE MAPPING
                </AppText>
                <View style={styles.card}>
                  {persons.length === 0 ? (
                    <AppText variant="LIST_SUBTITLE" color={Colors.TEXT_SECONDARY}>
                      No people added yet. Add people in the People tab.
                    </AppText>
                  ) : (
                    persons.map((person, i) => (
                      <View key={person.id}>
                        {i > 0 && <Divider />}
                        <View style={styles.mappingRow}>
                          <View style={{ flex: 1 }}>
                            <AppText variant="LIST_TITLE">{person.name}</AppText>
                            {person.splitwise_user_name ? (
                              <AppText variant="CAPTION" color={Colors.INFO_TEXT}>
                                → {person.splitwise_user_name}
                              </AppText>
                            ) : (
                              <AppText variant="CAPTION" color={Colors.TEXT_TERTIARY}>Not mapped</AppText>
                            )}
                          </View>
                          <View style={styles.mappingActions}>
                            {groupMembers.length > 0 ? (
                              groupMembers.map((m: any) => (
                                <TouchableOpacity
                                  key={m.id}
                                  onPress={() => handleMapPerson(person, String(m.id), `${m.first_name} ${m.last_name}`)}
                                  style={[
                                    styles.memberChip,
                                    person.splitwise_user_id === String(m.id) && styles.memberChipSelected,
                                  ]}
                                >
                                  <AppText variant="CAPTION" color={
                                    person.splitwise_user_id === String(m.id) ? Colors.ACCENT_TEXT : Colors.TEXT_SECONDARY
                                  }>
                                    {m.first_name}
                                  </AppText>
                                </TouchableOpacity>
                              ))
                            ) : (
                              <AppText variant="CAPTION" color={Colors.TEXT_TERTIARY}>
                                Select a group first
                              </AppText>
                            )}
                            {person.splitwise_user_id && (
                              <TouchableOpacity onPress={() => handleUnmapPerson(person)} style={styles.unmapBtn}>
                                <AppText variant="CAPTION" color={Colors.ERROR_TEXT}>Unmap</AppText>
                              </TouchableOpacity>
                            )}
                          </View>
                        </View>
                      </View>
                    ))
                  )}
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BG },
  content: { padding: Spacing.LG, paddingBottom: Spacing.XXL },
  heading: { marginBottom: Spacing.LG },
  sectionLabel: { marginBottom: Spacing.SM },
  card: {
    backgroundColor: Colors.WHITE,
    borderRadius: 14,
    padding: Spacing.MD,
    marginBottom: Spacing.LG,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    shadowColor: '#1A2634',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  groupRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Spacing.SM,
    marginTop: Spacing.XS,
    borderRadius: 8,
    backgroundColor: Colors.BG,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  groupRowSelected: { backgroundColor: Colors.ACCENT_MUTED },
  mappingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.SM,
    gap: Spacing.SM,
  },
  mappingActions: { flexWrap: 'wrap', flexDirection: 'row', gap: 4, flex: 1, justifyContent: 'flex-end' },
  memberChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: Colors.SURFACE,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  memberChipSelected: { backgroundColor: Colors.ACCENT_MUTED, borderColor: Colors.ACCENT },
  unmapBtn: { paddingHorizontal: 8, paddingVertical: 3 },
});
