"use client";
import { usePathname } from "next/navigation";
import { useClipboardCopy } from "@/hooks/useClipboardCopy";
import { toaster } from "./ui/toaster";
import { Link } from "@chakra-ui/react";
import { useEffect, useState } from "react";

const CopyLink = ({
  children,
  copyText,
}: {
  children: React.ReactNode;
  copyText: string;
}) => {
  const { handleClipboardCopy } = useClipboardCopy();

  const [url, setUrl] = useState("");
  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  return (
    <Link
      onClick={() => {
        handleClipboardCopy(url + copyText);
        toaster.create({
          description: "URLをコピーしました。",
          type: "success",
          closable: true,
        });
      }}
      target="_blank"
      rel="noopener noreferrer"
      textDecoration="underline"
      color="blue.600"
      _hover={{ color: "blue.800" }}
      _visited={{ color: "purple.600" }}
    >
      {children}
    </Link>
  );
};

export default CopyLink;
