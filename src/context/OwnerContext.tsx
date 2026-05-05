import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

const OWNER_PIN = '18032001';
const OWNER_KEY = 'is_owner_device';

interface OwnerContextValue {
  isOwner: boolean;
  claimOwnership: (pin: string) => Promise<boolean>;
  revokeOwnership: () => Promise<void>;
  loaded: boolean;
}

const OwnerContext = createContext<OwnerContextValue>({
  isOwner: false,
  claimOwnership: async () => false,
  revokeOwnership: async () => {},
  loaded: false,
});

export function OwnerProvider({ children }: { children: React.ReactNode }) {
  const [isOwner, setIsOwner] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync(OWNER_KEY)
      .then((val) => {
        setIsOwner(val === 'true');
      })
      .catch(() => {
        setIsOwner(false);
      })
      .finally(() => {
        setLoaded(true);
      });
  }, []);

  async function claimOwnership(pin: string): Promise<boolean> {
    if (pin === OWNER_PIN) {
      await SecureStore.setItemAsync(OWNER_KEY, 'true');
      setIsOwner(true);
      return true;
    }
    return false;
  }

  async function revokeOwnership() {
    await SecureStore.deleteItemAsync(OWNER_KEY);
    setIsOwner(false);
  }

  return (
    <OwnerContext.Provider value={{ isOwner, claimOwnership, revokeOwnership, loaded }}>
      {children}
    </OwnerContext.Provider>
  );
}

export function useOwner() {
  return useContext(OwnerContext);
}
