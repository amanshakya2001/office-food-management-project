import React, { createContext, useContext, useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { initDB } from './database';
import { Colors } from '../theme/tokens';

interface DBContextValue {
  ready: boolean;
}

const DBContext = createContext<DBContextValue>({ ready: false });

export function DBProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initDB()
      .then(() => setReady(true))
      .catch((e) => console.error('DB init failed', e));
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.BG, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={Colors.ACCENT} size="large" />
      </View>
    );
  }

  return <DBContext.Provider value={{ ready }}>{children}</DBContext.Provider>;
}

export function useDB() {
  return useContext(DBContext);
}
