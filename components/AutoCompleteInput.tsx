"use client";

import {
  Box,
  CloseButton,
  Input,
  InputGroup,
  List,
  ListItem,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";

type Props = {
  name: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: string[];
  listWidth?: string;
};

export default function AutoCompleteInput({
  name,
  value,
  onChange,
  placeholder,
  options,
  listWidth,
}: Props) {
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!value) return [];
    return options.filter((o) => o.includes(value)).slice(0, 100);
  }, [value, options]);

  return (
    <Box position="relative" className="flex items-center">
      <InputGroup endElement={<CloseButton onClick={() => onChange("")} />}>
        <Input
          name={name}
          value={value}
          placeholder={placeholder}
          bg="blackAlpha.300"
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setTimeout(() => setOpen(true), 150)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
        />
      </InputGroup>

      {open && filtered.length > 0 && (
        <List.Root
          position="absolute"
          top="100%"
          bg="black"
          w={listWidth ?? "110%"}
          mt={1}
          borderRadius="md"
          boxShadow="md"
          zIndex={20}
          maxH="200px"
          overflowY="auto"
        >
          {filtered.map((item) => (
            <ListItem
              key={item}
              px={3}
              py={2}
              cursor="pointer"
              _hover={{ bg: "gray.700" }}
              onMouseDown={() => onChange(item)}
            >
              {item}
            </ListItem>
          ))}
        </List.Root>
      )}
    </Box>
  );
}
