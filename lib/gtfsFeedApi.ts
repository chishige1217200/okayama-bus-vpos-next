"use server";
import { Agency } from "@/types/agency";
import { Routes } from "@/types/gtfsFeed";
import fs from "fs";
import path from "path";

const getRoutesPath = (agency: Agency): string => {
  switch (agency) {
    case Agency.OKADEN:
      return path.resolve(process.cwd(), "data", "okaden", "routes.txt");
    case Agency.RYOBI:
      return path.resolve(process.cwd(), "data", "ryobi", "routes.txt");
    case Agency.HAKKOU:
      return path.resolve(process.cwd(), "data", "hakkou", "routes.txt");
    default:
      return "";
  }
};

export const getRoutes = (agency: Agency): Routes[] => {
  // TODO: 実装
  return [];
};
