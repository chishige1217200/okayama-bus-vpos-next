"use client";
import Main from "@/components/main";
import { useAgency } from "@/context/AgencyContext";
import { SearchState, useSearch } from "@/context/SearchContext";
import { useTracking } from "@/context/TrackingContext";
import { Agency } from "@/types/agency";
import { Box, Center, Image, Link, Text } from "@chakra-ui/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const STORAGE_KEY = "termsAgreed";

export default function Home() {
  const [agreed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return Boolean(localStorage.getItem(STORAGE_KEY));
  });

  const { searchAgencies, setSearchAgencies } = useAgency();
  const { state, setState } = useSearch();
  const { trackingVehicleId, setTrackingVehicleId } = useTracking();
  const searchParams = useSearchParams();

  // クエリパラメータを各Contextに反映（初回のみ）
  useEffect(() => {
    // 事業者
    const agencies: Agency[] = [];
    if (searchParams.get("okaden")?.toLowerCase() !== "false") {
      agencies.push(Agency.OKADEN);
    }
    if (searchParams.get("ryobi")?.toLowerCase() !== "false") {
      agencies.push(Agency.RYOBI);
    }
    if (searchParams.get("hakkou")?.toLowerCase() !== "false") {
      agencies.push(Agency.HAKKOU);
    }
    setSearchAgencies(agencies);

    // 検索状態
    const searchKeys = [
      "search_vehicle",
      "from_stop",
      "via_stop",
      "to_stop",
      "route",
    ] as const;
    const restored: Partial<SearchState> = {};
    for (const key of searchKeys) {
      const value = searchParams.get(key);
      if (value) {
        restored[key] = value;
      }
    }
    if (Object.keys(restored).length > 0) {
      setState({ ...state, ...restored });
    }

    // 追跡対象
    const trackingVehicle = searchParams.get("tracking_vehicle");
    if (trackingVehicle) {
      setTrackingVehicleId(trackingVehicle);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // クエリパラメータの変更をURLに反映
  useEffect(() => {
    const params = new URLSearchParams();

    Object.entries(state).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });

    Object.entries({
      okaden: searchAgencies.includes(Agency.OKADEN) ? "true" : "false",
      ryobi: searchAgencies.includes(Agency.RYOBI) ? "true" : "false",
      hakkou: searchAgencies.includes(Agency.HAKKOU) ? "true" : "false",
    }).forEach(([key, value]) => {
      params.set(key, value);
    });

    if (trackingVehicleId) {
      params.set("tracking_vehicle", trackingVehicleId);
    }

    window.history.replaceState(null, "", `?${params.toString()}`);
  }, [searchAgencies, state, trackingVehicleId]);

  return agreed ? (
    <Main />
  ) : (
    <Center minH="100dvh" px={{ base: 4, md: 6 }} py={{ base: 6, md: 10 }}>
      <Box
        borderWidth="1px"
        borderRadius="md"
        p={{ base: 4, md: 6 }}
        maxH={{ base: "60vh", md: "65vh" }}
        overflowY="auto"
        bg="gray.50"
        fontSize={{ base: "sm", md: "md" }}
      >
        <Center>
          <Image
            src={"/logo192.png"}
            alt="岡山バス位置情報サービス"
            height={20}
            style={{ marginBottom: "1rem" }}
          />
        </Center>
        <Center gap={1} mb={4}>
          <Text fontSize="lg" fontWeight="bold" color="blackAlpha.900">
            岡山バス位置情報サービス
          </Text>
          <Image src="/next.svg" alt="Next.js logo" height={4} />
        </Center>
        <Text whiteSpace="pre-wrap" color="blackAlpha.900">
          {`岡山バス位置情報サービスを利用するには、`}
          <br />
          <Link
            href={"/terms"}
            textDecoration="underline"
            color="blue.600"
            _hover={{ color: "blue.800" }}
            _visited={{ color: "purple.600" }}
          >
            利用規約
          </Link>
          {`に同意してください。`}
        </Text>
      </Box>
    </Center>
  );
}
