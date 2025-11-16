"use server";
import { Agency } from "@/types/agency";
import { Icon } from "@/types/icon";
import { parse } from "csv-parse/sync";
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

export const getIcon = async (agency: Agency): Promise<Icon[]> => {
  try {
    const filePath = getIconPath(agency);

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

    return records as Icon[];
  } catch (error) {
    console.error("Error in getIcon: ", error);
    throw error;
  }
};
