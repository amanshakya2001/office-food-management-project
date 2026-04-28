import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import {
  useFonts,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import { DMMono_400Regular } from '@expo-google-fonts/dm-mono';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DBProvider } from './src/db/DBContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { Colors } from './src/theme/tokens';

export default function App() {
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    DMMono_400Regular,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.BG, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={Colors.ACCENT} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <DBProvider>
        <NavigationContainer>
          <StatusBar style="light" backgroundColor={Colors.BG} />
          <RootNavigator />
        </NavigationContainer>
      </DBProvider>
    </SafeAreaProvider>
  );
}
