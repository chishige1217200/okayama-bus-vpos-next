"use client";
import { Box, Center, Link, Text } from "@chakra-ui/react";

export default function Home() {
  return (
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
        <Text whiteSpace="pre-wrap" color="blackAlpha.900">
          {`旧システムのサポートは終了しました。\n\n新システムは `}
          <Link
            href={"/"}
            textDecoration="underline"
            color="blue.600"
            _hover={{ color: "blue.800" }}
            _visited={{ color: "purple.600" }}
          >
            こちら
          </Link>
        </Text>
      </Box>
    </Center>
  );
}
