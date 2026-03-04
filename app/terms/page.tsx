"use client";

import {
  Box,
  Button,
  Center,
  Checkbox,
  Container,
  Heading,
  Link,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const STORAGE_KEY = "termsAgreed";

export default function TermsPage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  // 同意ボタン押下
  const handleAgree = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    router.push("/");
  };

  const termsText = `この利用規約は、このウェブサイト上で提供する岡山バス位置情報サービス（以下、「本サービス」と言います。）の利用条件を定めるものです。
利用者の皆さまには、利用規約に従って、本サービスをご利用いただきます。

第1条（保証の否認および免責事項）
　1. 本サービスをご利用された結果、あるいは利用できない等により直接的または間接的に生じたあらゆる損害、損失については、本サービス管理者および各バス事業者は一切の責任を負いません。
　2. 本サービスは、バスの運行情報等を提供することで、利用者の利便性を図るものですが、その情報等についての安全性、確実性、有用性などの保証は負いかねますので、あらかじめご了承ください。
　3. 本サービスの正確性について、万全を期しておりますが利用者がデータを用いて行う一切の行為について、本サービス管理者および各バス事業者は一切の責任を負いません。

第2条（禁止事項）
利用者は、本サービスの利用にあたり、以下の行為をしてはなりません。
　1. 法令または公序良俗に違反する行為
　2. 犯罪行為に関連する行為
　3. 本サービスの内容等、本サービスに含まれる著作権、商標権、他知的財産権を侵害する行為
　4. 本サービス管理者、他の利用者、またはその他第三者のサーバーまたはネットワークの機能を破壊したり、妨害したりする行為
　5. 本サービスの運営を妨害するおそれのある行為
　6. 不正アクセスをし、またはこれを試みる行為
　7. 不正な目的を持って本サービスを利用する行為
　8. 本サービスの他の利用者またはその他の第三者に不利益、損害、不快感を与える行為
　9. その他、本サービス管理者が不適切と判断する行為

第3条（個人情報の取扱い）
　本サービスは、利用者の現在地付近のバス運行情報を迅速に提供するために位置情報を収集しますが、利用者は収集を拒否することができます。
　位置情報の収集に同意したかどうかに関わらず、バス運行情報を閲覧することができます。
　収集した位置情報は利用者の端末上でのみ処理され、サーバーには送信されません。

以上`;

  return (
    <Center minH="100dvh" px={{ base: 4, md: 6 }} py={{ base: 6, md: 10 }}>
      <Container
        maxW={{
          base: "100%",
          sm: "container.sm",
          md: "container.md",
          lg: "container.lg",
        }}
      >
        <VStack gap={6} align="stretch">
          <Heading size="lg" textAlign="center">
            利用規約
          </Heading>
          <Box
            borderWidth="1px"
            borderRadius="md"
            p={{ base: 4, md: 6 }}
            w="100%"
            maxH={{ base: "60vh", md: "65vh" }}
            overflowY="auto"
            bg="gray.50"
            fontSize={{ base: "sm", md: "md" }}
          >
            <Text whiteSpace="pre-wrap" color="blackAlpha.900">
              {termsText}
              <br />
              {"\n"}本サービスの提供には、
              <Link
                href="https://loc.bus-vision.jp/ryobi/view/opendata.html"
                color="blue.600"
                textDecoration="underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Bus-Vision
              </Link>
              オープンデータを使用しています。
              {"\n"}
              本サービス管理者と各バス事業者との間に関係はありません。本サービスに関するお問い合わせを各バス事業者へ行うことはご遠慮ください。
              {"\n"}対象のバス事業者：
              <Link
                href="https://www.ryobi-holdings.jp/bus/"
                color="blue.600"
                textDecoration="underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                両備バス
              </Link>{" "}
              <Link
                href="https://www.okayama-kido.co.jp/bus/"
                color="blue.600"
                textDecoration="underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                岡電バス
              </Link>{" "}
              <Link
                href="https://megurin-okayama.com/"
                color="blue.600"
                textDecoration="underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                八晃運輸
              </Link>
            </Text>
          </Box>

          <Checkbox.Root
            checked={checked}
            onCheckedChange={(e) => setChecked(!!e.checked)}
          >
            <Checkbox.HiddenInput />
            <Checkbox.Control />
            <Checkbox.Label>利用規約に同意します</Checkbox.Label>
          </Checkbox.Root>

          <Button
            colorScheme="blue"
            size="lg"
            onClick={handleAgree}
            disabled={!checked}
            w="100%"
          >
            同意して続行
          </Button>
        </VStack>
      </Container>
    </Center>
  );
}
