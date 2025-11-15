"use server";
import { Agency } from "@/types/agency";
import { Icon } from "@/types/icon";
import fs from "fs";
import path from "path";

const getIconPath = (agency: Agency): string => {
  switch (agency) {
    case Agency.OKADEN:
      return path.resolve(process.cwd(), "data", "okaden", "vehicle_icon.csv");
    case Agency.RYOBI:
      return path.resolve(process.cwd(), "data", "ryobi", "vehicle_icon.csv");
    case Agency.HAKKOU:
      return path.resolve(process.cwd(), "data", "hakkou", "vehicle_icon.csv");
    default:
      return "";
  }
};

export const getIcon = (agency: Agency): Icon[] => {
  // TODO: 実装
  return [];
};
