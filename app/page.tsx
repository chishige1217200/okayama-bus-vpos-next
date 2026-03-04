"use client";
import Main from "@/components/main";
import { useAgency } from "@/context/AgencyContext";
import { Agency } from "@/types/agency";
import { Box, Center, HStack, Link, Text } from "@chakra-ui/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "termsAgreed";

export default function Home() {
  const [agreed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return Boolean(localStorage.getItem(STORAGE_KEY));
  });

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

  return agreed ? (
    <Main />
  ) : (
    <Center minH="100vh">
      <Box textAlign="center" bg="bg.emphasized" padding={4} rounded={16}>
        <Text>システムを利用するには、利用規約に同意する必要があります。</Text>

        <HStack justify="center" mt={2}>
          <Text>利用規約は</Text>
          <Link
            href={"/terms"}
            textDecoration="underline"
            color="blue.600"
            _hover={{ color: "blue.800" }}
            _visited={{ color: "purple.600" }}
          >
            こちら
          </Link>
        </HStack>
      </Box>
    </Center>
  );
}
