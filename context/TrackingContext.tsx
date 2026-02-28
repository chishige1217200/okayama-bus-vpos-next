"use client";

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from "react";

type TrackingContextType = {
  trackingVehicleId: string;
  setTrackingVehicleId: (id: string) => void;
};

const TrackingContext = createContext<TrackingContextType | null>(null);

export function TrackingProvider({ children }: { children: React.ReactNode }) {
  const [trackingVehicleId, setTrackingVehicleIdState] = useState("");

  // ✅ setterをラップ（将来の拡張に強い）
  const setTrackingVehicleId = useCallback((id: string) => {
    setTrackingVehicleIdState(id);
  }, []);

  // ✅ 参照安定化
  const value = useMemo(
    () => ({
      trackingVehicleId,
      setTrackingVehicleId,
    }),
    [trackingVehicleId, setTrackingVehicleId]
  );

  return (
    <TrackingContext.Provider value={value}>
      {children}
    </TrackingContext.Provider>
  );
}

export function useTracking() {
  const ctx = useContext(TrackingContext);
  if (!ctx) throw new Error("useTracking must be used within TrackingProvider");
  return ctx;
}