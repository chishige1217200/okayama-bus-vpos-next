import { fetchData } from "@/lib/busVisionApi";
import { ApiErrorResponse } from "@/types/ApiErrorResponse";
import { VposUpdate } from "@/types/vposUpdate";
import { NextResponse } from "next/server";

// GET /api/okaden/vehicle_position/
export async function GET(): Promise<
  NextResponse<VposUpdate[] | ApiErrorResponse>
> {
  try {
    return NextResponse.json(
      await fetchData(
        "https://loc.bus-vision.jp/realtime/okaden_vpos_update.bin"
      ),
      { status: 200 }
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      const apiErrorResponse: ApiErrorResponse = {
        error: error.message,
        status: 500,
      };
      return NextResponse.json(apiErrorResponse, { status: 500 });
    } else {
      const apiErrorResponse: ApiErrorResponse = {
        error: "Unknown error occurred",
        status: 500,
      };
      return NextResponse.json(apiErrorResponse, { status: 500 });
    }
  }
}
