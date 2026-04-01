"use client";

import { AppStore, makeStore } from "@/redux/store";
import { setupListeners } from "@reduxjs/toolkit/query";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Provider } from "react-redux";

interface StoreProviderProps {
  readonly children: ReactNode;
}

export const StoreProvider = ({ children }: StoreProviderProps) => {
  const [store] = useState<AppStore>(() => makeStore());

  useEffect(() => {
    const unsubscribe = setupListeners(store.dispatch);
    return unsubscribe;
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
};