"use client";

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from "react";

type SearchContextType = {
  searchVehicleName: string;
  setSearchVehicleName: (name: string) => void;
  fromStopName: string;
  setFromStopName: (name: string) => void;
  viaStopName: string;
  setViaStopName: (name: string) => void;
  toStopName: string;
  setToStopName: (name: string) => void;
  routeName: string;
  setRouteName: (name: string) => void;
};

const SearchContext = createContext<SearchContextType | null>(null);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  // 号車検索
  const [searchVehicleName, setSearchVehicleNameState] = useState("");
  // 出発地検索
  const [fromStopName, setFromStopNameState] = useState("");
  // 経由地検索
  const [viaStopName, setViaStopNameState] = useState("");
  // 到着地検索
  const [toStopName, setToStopNameState] = useState("");
  // 路線名検索
  const [routeName, setRouteNameState] = useState("");

  const setSearchVehicleName = useCallback((name: string) => {
    setSearchVehicleNameState(name);
  }, []);

  const setFromStopName = useCallback((name: string) => {
    setFromStopNameState(name);
  }, []);

  const setViaStopName = useCallback((name: string) => {
    setViaStopNameState(name);
  }, []);

  const setToStopName = useCallback((name: string) => {
    setToStopNameState(name);
  }, []);

  const setRouteName = useCallback((name: string) => {
    setRouteNameState(name);
  }, []);

  const value = useMemo(
    () => ({
      searchVehicleName,
      setSearchVehicleName,
      fromStopName,
      setFromStopName,
      viaStopName,
      setViaStopName,
      toStopName,
      setToStopName,
      routeName,
      setRouteName,
    }),
    [
      searchVehicleName,
      setSearchVehicleName,
      fromStopName,
      setFromStopName,
      viaStopName,
      setViaStopName,
      toStopName,
      setToStopName,
      routeName,
      setRouteName,
    ],
  );

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearch must be used within SearchProvider");
  return ctx;
}
