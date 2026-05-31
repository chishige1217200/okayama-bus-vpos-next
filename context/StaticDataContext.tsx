"use client";

import { Agency } from "@/types/agency";
import { Routes, RoutesJp, Stops } from "@/types/gtfsFeed";
import { Icon } from "@/types/icon";
import { useAgency } from "@/context/AgencyContext";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";

export type StaticData = {
  routesList: Routes[] | null;
  routesJpList: RoutesJp[] | null;
  stopsList: Stops[] | null;
  iconList: Icon[] | null;
};

type StaticDataContextType = {
  staticData: Record<string, StaticData>;
  fetchStaticData: (agency: Agency) => Promise<void>;
  routesList: Routes[] | null;
  routesJpList: RoutesJp[] | null;
  stopsList: Stops[] | null;
  iconList: Icon[] | null;
};

const StaticDataContext = createContext<StaticDataContextType | null>(null);

export function StaticDataProvider({ children }: { children: React.ReactNode }) {
  const { searchAgencies } = useAgency();
  const [staticData, setStaticData] = useState<Record<string, StaticData>>({});
  const fetchedOrFetching = useRef<Record<string, boolean>>({});

  const fetchStaticData = useCallback(async (agency: Agency) => {
    if (fetchedOrFetching.current[agency]) return;
    fetchedOrFetching.current[agency] = true;

    const fetchRoutes = async () => {
      const response = await fetch(`/api/get_routes/?agency=${agency}`);
      return response.ok ? await response.json() : [];
    };

    const fetchRoutesJp = async () => {
      const response = await fetch(`/api/get_routes_jp/?agency=${agency}`);
      return response.ok ? await response.json() : [];
    };

    const fetchStops = async () => {
      const response = await fetch(`/api/get_stops/?agency=${agency}`);
      return response.ok ? await response.json() : [];
    };

    const fetchIcon = async () => {
      const response = await fetch(`/api/get_icon/?agency=${agency}`);
      return response.ok ? await response.json() : [];
    };

    try {
      const [routes, routesJp, stops, icons] = await Promise.all([
        fetchRoutes(),
        fetchRoutesJp(),
        fetchStops(),
        fetchIcon(),
      ]);

      setStaticData((prev) => ({
        ...prev,
        [agency]: {
          routesList: routes,
          routesJpList: routesJp,
          stopsList: stops,
          iconList: icons,
        },
      }));
    } catch (error) {
      console.error(`Failed to fetch static data for agency ${agency}:`, error);
      // Reset flag to allow retry in case of failure
      fetchedOrFetching.current[agency] = false;
    }
  }, []);

  const routesList = useMemo(() => {
    const list: Routes[] = [];
    searchAgencies.forEach((agency) => {
      const data = staticData[agency];
      if (data && data.routesList) list.push(...data.routesList);
    });
    return list.length > 0 ? list : null;
  }, [staticData, searchAgencies]);

  const routesJpList = useMemo(() => {
    const list: RoutesJp[] = [];
    searchAgencies.forEach((agency) => {
      const data = staticData[agency];
      if (data && data.routesJpList) list.push(...data.routesJpList);
    });
    return list.length > 0 ? list : null;
  }, [staticData, searchAgencies]);

  const stopsList = useMemo(() => {
    const list: Stops[] = [];
    searchAgencies.forEach((agency) => {
      const data = staticData[agency];
      if (data && data.stopsList) list.push(...data.stopsList);
    });
    return list.length > 0 ? list : null;
  }, [staticData, searchAgencies]);

  const iconList = useMemo(() => {
    const list: Icon[] = [];
    searchAgencies.forEach((agency) => {
      const data = staticData[agency];
      if (data && data.iconList) list.push(...data.iconList);
    });
    return list.length > 0 ? list : null;
  }, [staticData, searchAgencies]);

  const value = useMemo(
    () => ({
      staticData,
      fetchStaticData,
      routesList,
      routesJpList,
      stopsList,
      iconList,
    }),
    [staticData, fetchStaticData, routesList, routesJpList, stopsList, iconList],
  );

  return (
    <StaticDataContext.Provider value={value}>
      {children}
    </StaticDataContext.Provider>
  );
}

export function useStaticData() {
  const ctx = useContext(StaticDataContext);
  if (!ctx) {
    throw new Error("useStaticData must be used within a StaticDataProvider");
  }
  return ctx;
}
