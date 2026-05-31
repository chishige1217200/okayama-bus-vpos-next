"use client";
import Main from "@/components/main";
import { useAgency } from "@/context/AgencyContext";
import { useSearch } from "@/context/SearchContext";
import { useTracking } from "@/context/TrackingContext";
import { Agency } from "@/types/agency";
import { Box, Center, Image, Link, Text } from "@chakra-ui/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "termsAgreed";

export default function Home() {
  const [agreed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return Boolean(localStorage.getItem(STORAGE_KEY));
  });

  const { searchAgencies, setSearchAgencies } = useAgency();
  const { state } = useSearch();
  const { trackingVehicleId, setTrackingVehicleId } = useTracking();
  const searchParams = useSearchParams();

  // クエリパラメータの解析
  // 現在システムで利用可能な事業者はagency.tsを参照
  const [okaden] = useState<boolean>(() => {
    return Boolean(searchParams.get("okaden")?.toLowerCase() !== "false");
  });
  const [ryobi] = useState<boolean>(() => {
    return Boolean(searchParams.get("ryobi")?.toLowerCase() !== "false");
  });
  const [hakkou] = useState<boolean>(() => {
    return Boolean(searchParams.get("hakkou")?.toLowerCase() !== "false");
  });
  const trackingVehicle = searchParams.get("tracking_vehicle") || undefined;

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

  useEffect(() => {
    if (trackingVehicle) {
      setTrackingVehicleId(trackingVehicle);
    }
  }, [trackingVehicle, setTrackingVehicleId]);

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
