import { NavigatorScreenParams } from '@react-navigation/native';

export type RootTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  PeopleTab: NavigatorScreenParams<PeopleStackParamList>;
  ExportTab: undefined;
  SettingsTab: undefined;
  AdminTab: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  NewEntry: { date?: string };
  DayDetail: { dayEntryId: number };
  CostEntry: { dayEntryId: number };
};

export type PeopleStackParamList = {
  People: undefined;
};
