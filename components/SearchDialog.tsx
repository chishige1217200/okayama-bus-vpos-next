"use client";

import {
  VStack,
  CheckboxGroup,
  Checkbox,
  HStack,
  Button,
  Field,
  Center,
  For,
} from "@chakra-ui/react";
import { useSearch } from "@/context/SearchContext";
import AutoCompleteInput from "./AutoCompleteInput";
import { useDebounce } from "@/hooks/useDebounce";
import { useAgency } from "@/context/AgencyContext";
import { getAgencyName } from "@/types/agency";

const stopOptions = ["岡山駅", "天満屋", "表町"]; // ← 実データに置換
const routeOptions = ["1系統", "2系統"];

export default function SearchForm() {
  const { searchAgencies } = useAgency();
  const { state, setState, clear } = useSearch();

  // ⭐ debounce
  const debounced = useDebounce(state, 300);

  // useEffect(() => {
  //   onSearch?.(); // 自動検索したい場合
  // }, [debounced]);

  return (
    <VStack align="stretch" gap={3}>
      <Field.Root>
        <Field.Label>事業者</Field.Label>
        <CheckboxGroup
          value={state.agencies}
          onValueChange={(v) => {
            console.log("Selected agencies:", v);
            setState({ ...state, agencies: v });
          }}
        >
          <HStack>
            {searchAgencies.map((value, index) => {
              const id = `agency-${value}-${index}`;

              return (
                <Checkbox.Root
                  key={id}
                  value={value}
                  ids={{
                    hiddenInput: `${id}-input`,
                    control: `${id}-control`,
                    label: `${id}-label`,
                  }}
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control />
                  <Checkbox.Label>{getAgencyName(value)}</Checkbox.Label>
                </Checkbox.Root>
              );
            })}
          </HStack>
        </CheckboxGroup>
      </Field.Root>

      <HStack align="flex-start" gap={6}>
        <VStack align="stretch" gap={3}>
          <Field.Root>
            <Field.Label>号車</Field.Label>
            <AutoCompleteInput
              value={state.search_vehicle}
              placeholder="号車検索"
              options={[]}
              onChange={(v) => setState({ ...state, search_vehicle: v })}
            />
          </Field.Root>

          <Field.Root>
            <Field.Label>路線</Field.Label>
            <AutoCompleteInput
              value={state.route}
              placeholder="路線"
              options={routeOptions}
              onChange={(v) => setState({ ...state, route: v })}
            />
          </Field.Root>
        </VStack>

        <VStack align="stretch" gap={3}>
          <Field.Root>
            <Field.Label>始点</Field.Label>
            <AutoCompleteInput
              value={state.from_stop}
              placeholder="始点"
              options={stopOptions}
              onChange={(v) => setState({ ...state, from_stop: v })}
            />
          </Field.Root>

          <Field.Root>
            <Field.Label>経由点</Field.Label>
            <AutoCompleteInput
              value={state.via_stop}
              placeholder="経由点"
              options={stopOptions}
              onChange={(v) => setState({ ...state, via_stop: v })}
            />
          </Field.Root>

          <Field.Root>
            <Field.Label>終点</Field.Label>
            <AutoCompleteInput
              value={state.to_stop}
              placeholder="終点"
              options={stopOptions}
              onChange={(v) => setState({ ...state, to_stop: v })}
            />
          </Field.Root>
        </VStack>
      </HStack>

      <Center>
        <HStack>
          <Button flex={1} onClick={clear} variant="outline">
            クリア
          </Button>
        </HStack>
      </Center>
    </VStack>
  );
}
