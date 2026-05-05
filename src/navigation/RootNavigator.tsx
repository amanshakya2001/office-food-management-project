import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootTabParamList, HomeStackParamList, PeopleStackParamList } from './types';
import { HomeScreen } from '../screens/Home/HomeScreen';
import { NewEntryScreen } from '../screens/NewEntry/NewEntryScreen';
import { DayDetailScreen } from '../screens/DayDetail/DayDetailScreen';
import { CostEntryScreen } from '../screens/CostEntry/CostEntryScreen';
import { PeopleScreen } from '../screens/People/PeopleScreen';
import { ExportScreen } from '../screens/Export/ExportScreen';
import { SettingsScreen } from '../screens/Settings/SettingsScreen';
import { AdminScreen } from '../screens/Admin/AdminScreen';
import { Colors } from '../theme/tokens';
import { useOwner } from '../context/OwnerContext';

const Tab = createBottomTabNavigator<RootTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const PeopleStack = createNativeStackNavigator<PeopleStackParamList>();

const screenOptions = {
  headerStyle: { backgroundColor: Colors.SURFACE },
  headerTintColor: Colors.TEXT_PRIMARY,
  headerTitleStyle: { fontFamily: 'DMSans_600SemiBold', fontSize: 17 },
  contentStyle: { backgroundColor: Colors.BG },
};

function HomeStackNav() {
  return (
    <HomeStack.Navigator screenOptions={screenOptions}>
      <HomeStack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <HomeStack.Screen name="NewEntry" component={NewEntryScreen} options={{ title: 'New Entry' }} />
      <HomeStack.Screen name="DayDetail" component={DayDetailScreen} options={{ title: 'Day Detail' }} />
      <HomeStack.Screen name="CostEntry" component={CostEntryScreen} options={{ title: 'Cost & Payer' }} />
    </HomeStack.Navigator>
  );
}

function PeopleStackNav() {
  return (
    <PeopleStack.Navigator screenOptions={screenOptions}>
      <PeopleStack.Screen name="People" component={PeopleScreen} options={{ headerShown: false }} />
    </PeopleStack.Navigator>
  );
}

const TAB_ICONS: Record<string, string> = {
  HomeTab: '🏠',
  PeopleTab: '👥',
  ExportTab: '📤',
  SettingsTab: '⚙️',
  AdminTab: '🍽️',
};

const TAB_LABELS: Record<string, string> = {
  HomeTab: 'Home',
  PeopleTab: 'People',
  ExportTab: 'Export',
  SettingsTab: 'Settings',
  AdminTab: 'Dishes',
};

export function RootNavigator() {
  const insets = useSafeAreaInsets();
  const { isOwner } = useOwner();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.WHITE,
          borderTopColor: Colors.BORDER,
          borderTopWidth: 1,
          height: 56 + insets.bottom,
          paddingTop: 6,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          shadowColor: '#1A2634',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: 20, lineHeight: 24, opacity: focused ? 1 : 0.45 }}>{TAB_ICONS[route.name]}</Text>
        ),
        tabBarLabel: ({ focused }) => (
          <Text style={{
            fontSize: 10,
            fontFamily: focused ? 'DMSans_600SemiBold' : 'DMSans_400Regular',
            color: focused ? Colors.ACCENT : Colors.TEXT_TERTIARY,
            marginTop: -2,
          }}>
            {TAB_LABELS[route.name]}
          </Text>
        ),
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStackNav} />
      <Tab.Screen name="PeopleTab" component={PeopleStackNav} />
      {isOwner && (
        <Tab.Screen name="ExportTab" component={ExportScreen} />
      )}
      {isOwner && (
        <Tab.Screen name="AdminTab" component={AdminScreen} />
      )}
      <Tab.Screen name="SettingsTab" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
