"use client";
import { Box, Center, HStack, Link, Text } from "@chakra-ui/react";

export default function Home() {
  return (
    <Center minH="100vh">
      <Box textAlign="center" bg="bg.emphasized" padding={4} rounded={16}>
        <Text>旧システムのサポートは終了しました。</Text>

        <HStack justify="center" mt={2}>
          <Text>新システムは</Text>
          <Link
            href={"/search"}
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
