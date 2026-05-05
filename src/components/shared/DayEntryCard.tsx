import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { AppText } from '../ui/AppText';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { Colors, Spacing, Radius, Shadow } from '../../theme/tokens';
import { DayEntry } from '../../types/models';
import { formatDisplayDate } from '../../services/dateUtils';

interface DayEntryCardProps {
  entry: DayEntry;
  participantNames: string[];
  onPress: () => void;
}

export function DayEntryCard({ entry, participantNames, onPress }: DayEntryCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75} style={styles.card}>
      <View style={styles.header}>
        <AppText variant="LIST_TITLE">{formatDisplayDate(entry.date)}</AppText>
        {entry.splitwise_synced ? (
          <Badge label="Synced" variant="success" />
        ) : entry.total_cost !== null ? (
          <Badge label="Unsynced" variant="accent" />
        ) : (
          <Badge label="Cost pending" variant="neutral" />
        )}
      </View>

      <View style={styles.row}>
        <View style={styles.avatarRow}>
          {participantNames.slice(0, 5).map((name, i) => (
            <View key={i} style={[styles.avatarWrap, { marginLeft: i > 0 ? -8 : 0 }]}>
              <Avatar name={name} size="SM" />
            </View>
          ))}
          {participantNames.length > 5 && (
            <AppText variant="CAPTION" color={Colors.TEXT_SECONDARY} style={styles.moreText}>
              +{participantNames.length - 5}
            </AppText>
          )}
        </View>
        {entry.total_cost !== null ? (
          <AppText variant="LIST_TITLE" color={Colors.ACCENT_TEXT}>
            ₹{entry.total_cost.toFixed(2)}
          </AppText>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.CARD,
    borderRadius: Radius.CARD,
    padding: Spacing.MD,
    marginHorizontal: Spacing.LG,
    marginVertical: Spacing.XS + 2,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    ...Shadow.CARD,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.SM,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {
    zIndex: 1,
  },
  moreText: {
    marginLeft: Spacing.XS,
  },
});
