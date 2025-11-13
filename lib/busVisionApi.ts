"use server";
import protobuf from "protobufjs";
import path from "path";

// gtfs-realtime.protoを読込
const loadProto = () => {
  return protobuf.load(
    path.resolve(process.cwd(), "data", "gtfs-realtime.proto")
  );
};

// データの取得
export const fetchData = async (source: string) => {
  try {
    const root = await loadProto();
    const FeedMessage = root.lookupType("transit_realtime.FeedMessage");

    // データの取得
    const res = await fetch(source);
    if (!res.ok) {
      console.error(`Error fetching data: ${res.status} ${res.statusText}`);
      throw new Error(`Error fetching data: ${res.status} ${res.statusText}`);
    }
    const binaryData = await res
      .arrayBuffer()
      .then((res) => new Uint8Array(res));

    // デコードとオブジェクト化
    const message = FeedMessage.decode(binaryData);
    const parsedArray = FeedMessage.toObject(message, {
      longs: String,
      enums: String,
      bytes: String,
    }).entity;

    // console.log("Parsed Data Array:", JSON.stringify(parsedArray, null, 2));
    return parsedArray ?? [];
  } catch (error) {
    console.error("Error in fetchData: ", error);
    throw error;
  }
};
