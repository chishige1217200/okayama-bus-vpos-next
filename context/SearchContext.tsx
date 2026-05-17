"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type SearchState = {
  agencies: string[];
  search_vehicle: string;
  from_stop: string;
  via_stop: string;
  to_stop: string;
  route: string;
};

const createDefaultState = (): SearchState => ({
  agencies: ["2", "3", "5"],
  search_vehicle: "",
  from_stop: "",
  via_stop: "",
  to_stop: "",
  route: "",
});

const SearchContext = createContext<{
  state: SearchState;
  setState: (v: SearchState) => void;
  clear: () => void;
} | null>(null);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SearchState>(createDefaultState);

  const clear = () => setState(createDefaultState);

  return (
    <SearchContext.Provider value={{ state, setState, clear }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearch must be used within provider");
  return ctx;
}
