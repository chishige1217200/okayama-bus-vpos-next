import { fetchData } from "@/lib/busVisionApi";
import { NextResponse } from "next/server";

// GET /api/ryobi/
export async function GET(request: Request) {
  return NextResponse.json(
    await fetchData("https://loc.bus-vision.jp/realtime/ryobi_trip_update.bin"),
    { status: 200 }
  );
}
