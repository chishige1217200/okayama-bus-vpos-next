import { fetchData } from "@/lib/busVisionApi";
import { NextResponse } from "next/server";

// GET /api/ryobi/vehicle_position/
export async function GET(request: Request) {
  return NextResponse.json(
    await fetchData("https://loc.bus-vision.jp/realtime/ryobi_vpos_update.bin"),
    { status: 200 }
  );
}
