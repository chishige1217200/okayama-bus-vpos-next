"use client";
import { AbsoluteCenter, HStack, Link, Text, VStack } from "@chakra-ui/react";

export default function Home() {
  return (
    <>
      <AbsoluteCenter>
        <VStack>
          <Text>旧システムのサポートは終了しました。</Text>
          <HStack>
            <Text>新システムは</Text>
            <Link
              href={"/"}
              textDecoration="underline"
              color="blue.600"
              _hover={{ color: "blue.800" }}
              _visited={{ color: "purple.600" }}
            >
              こちら
            </Link>
          </HStack>
        </VStack>
      </AbsoluteCenter>
    </>
  );
}
