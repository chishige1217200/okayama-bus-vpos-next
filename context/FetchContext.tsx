"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";

type FetchContextType = {
  trigger: number;
  fire: () => void;
  start: () => void;
  finish: () => void;
  isLoading: boolean;
};

const FetchContext = createContext<FetchContextType | null>(null);

export function FetchProvider({ children }: { children: React.ReactNode }) {
  const [trigger, setTrigger] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  // 🔹 親が押す
  const fire = useCallback(() => {
    setTrigger((t) => t + 1);
  }, []);

  // 🔹 子が開始通知
  const start = useCallback(() => {
    setPendingCount((c) => c + 1);
  }, []);

  // 🔹 子が終了通知
  const finish = useCallback(() => {
    setPendingCount((c) => Math.max(0, c - 1));
  }, []);

  const isLoading = pendingCount > 0;

  const value = useMemo(
    () => ({
      trigger,
      fire,
      start,
      finish,
      isLoading,
    }),
    [trigger, fire, start, finish, isLoading],
  );

  return (
    <FetchContext.Provider value={value}>{children}</FetchContext.Provider>
  );
}

export function useFetchController() {
  const ctx = useContext(FetchContext);
  if (!ctx) throw new Error("useFetchController must be used within provider");
  return ctx;
}
