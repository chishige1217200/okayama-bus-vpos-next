"use client";

import { Agency } from "@/types/agency";
import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from "react";

type SearchContextType = {
  searchAgencies: Agency[];
  setSearchAgencies: (agencies: Agency[]) => void;
};

const AgencyContext = createContext<SearchContextType | null>(null);

export function AgencyProvider({ children }: { children: React.ReactNode }) {
  const [searchAgencies, setSearchAgenciesState] = useState<Agency[]>([]);

  const setSearchAgencies = useCallback((agencies: Agency[]) => {
    setSearchAgenciesState(agencies);
  }, []);

  const value = useMemo(
    () => ({
      searchAgencies,
      setSearchAgencies,
    }),
    [searchAgencies, setSearchAgencies],
  );

  return (
    <AgencyContext.Provider value={value}>{children}</AgencyContext.Provider>
  );
}

export function useAgency() {
  const ctx = useContext(AgencyContext);
  if (!ctx) throw new Error("useAgency must be used within AgencyProvider");
  return ctx;
}
