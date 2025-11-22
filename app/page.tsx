"use client";
import Main from "@/components/main";
import { useSearchParams } from "next/navigation";

export default function Home() {
  const searchParams = useSearchParams();

  const okaden = Boolean(searchParams.get("okaden")?.toLowerCase() !== "false");
  const ryobi = Boolean(searchParams.get("ryobi")?.toLowerCase() !== "false");
  const hakkou = Boolean(searchParams.get("hakkou")?.toLowerCase() !== "false");

  return <Main okaden={okaden} ryobi={ryobi} hakkou={hakkou} />;
}
