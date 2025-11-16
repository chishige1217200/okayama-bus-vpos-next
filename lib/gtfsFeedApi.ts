"use server";
import { Agency } from "@/types/agency";
import { Routes, RoutesJp, Stops } from "@/types/gtfsFeed";
import { parse } from "csv-parse/sync";
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

const getRoutesJpPath = (agency: Agency): string => {
  switch (agency) {
    case Agency.OKADEN:
      return path.resolve(process.cwd(), "data", "okaden", "routes_jp.txt");
    case Agency.RYOBI:
      return path.resolve(process.cwd(), "data", "ryobi", "routes_jp.txt");
    case Agency.HAKKOU:
      return path.resolve(process.cwd(), "data", "hakkou", "routes_jp.txt");
    default:
      return "";
  }
};

const getStopsPath = (agency: Agency): string => {
  switch (agency) {
    case Agency.OKADEN:
      return path.resolve(process.cwd(), "data", "okaden", "stops.txt");
    case Agency.RYOBI:
      return path.resolve(process.cwd(), "data", "ryobi", "stops.txt");
    case Agency.HAKKOU:
      return path.resolve(process.cwd(), "data", "hakkou", "stops.txt");
    default:
      return "";
  }
};

export const getRoutes = async (agency: Agency): Promise<Routes[]> => {
  try {
    const filePath = getRoutesPath(agency);

    // ファイルパスが無効な場合は空配列を返す
    if (!filePath) {
      return [];
    }

    // ファイルが存在しない場合は空配列を返す
    if (!fs.existsSync(filePath)) {
      return [];
    }

    const csvText = fs.readFileSync(filePath, "utf-8");

    const records = parse(csvText, {
      columns: true, // 1行目をオブジェクトのキーとして使う
      skip_empty_lines: true,
      trim: true, // 前後の空白削除
    });

    return records as Routes[];
  } catch (error) {
    console.error("Error in getRoutes: ", error);
    throw error;
  }
};

export const getRoutesJp = async (agency: Agency): Promise<RoutesJp[]> => {
  try {
    const filePath = getRoutesJpPath(agency);

    // ファイルパスが無効な場合は空配列を返す
    if (!filePath) {
      return [];
    }

    // ファイルが存在しない場合は空配列を返す
    if (!fs.existsSync(filePath)) {
      return [];
    }

    const csvText = fs.readFileSync(filePath, "utf-8");

    const records = parse(csvText, {
      columns: true, // 1行目をオブジェクトのキーとして使う
      skip_empty_lines: true,
      trim: true, // 前後の空白削除
    });

    return records as RoutesJp[];
  } catch (error) {
    console.error("Error in getRoutes: ", error);
    throw error;
  }
};

export const getStops = async (agency: Agency): Promise<Stops[]> => {
  try {
    const filePath = getStopsPath(agency);

    // ファイルパスが無効な場合は空配列を返す
    if (!filePath) {
      return [];
    }

    // ファイルが存在しない場合は空配列を返す
    if (!fs.existsSync(filePath)) {
      return [];
    }

    const csvText = fs.readFileSync(filePath, "utf-8");

    const records = parse(csvText, {
      columns: true, // 1行目をオブジェクトのキーとして使う
      skip_empty_lines: true,
      trim: true, // 前後の空白削除
    });

    return records as Stops[];
  } catch (error) {
    console.error("Error in getStops: ", error);
    throw error;
  }
};
