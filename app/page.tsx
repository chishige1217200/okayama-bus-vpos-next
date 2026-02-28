"use client";
import Main from "@/components/main";
import { useAgency } from "@/context/AgencyContext";
import { Agency } from "@/types/agency";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";

export default function Home() {
  const { setSearchAgencies } = useAgency();
  const searchParams = useSearchParams();

  const okaden = Boolean(searchParams.get("okaden")?.toLowerCase() !== "false");
  const ryobi = Boolean(searchParams.get("ryobi")?.toLowerCase() !== "false");
  const hakkou = Boolean(searchParams.get("hakkou")?.toLowerCase() !== "false");

  const agencyArray = useMemo(() => {
    const array: Agency[] = [];
    if (okaden) array.push(Agency.OKADEN);
    if (ryobi) array.push(Agency.RYOBI);
    if (hakkou) array.push(Agency.HAKKOU);
    return array;
  }, [okaden, ryobi, hakkou]);

  useEffect(() => {
    setSearchAgencies(agencyArray);
  }, [agencyArray, setSearchAgencies]);

  return <Main />;
}
