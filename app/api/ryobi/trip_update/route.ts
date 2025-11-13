import { fetchData } from "@/lib/busVisionApi";
import { ApiErrorResponse } from "@/types/ApiErrorResponse";
import { TripUpdate } from "@/types/tripUpdate";
import { NextResponse } from "next/server";

// GET /api/ryobi/trip_update/
export async function GET(): Promise<
  NextResponse<TripUpdate[] | ApiErrorResponse>
> {
  try {
    return NextResponse.json(
      await fetchData(
        "https://loc.bus-vision.jp/realtime/ryobi_trip_update.bin"
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
