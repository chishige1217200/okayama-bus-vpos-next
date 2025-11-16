import { fetchData } from "@/lib/busVisionApi";
import { Agency, getTripUpdateUrl } from "@/types/agency";
import { ApiErrorResponse } from "@/types/apiErrorResponse";
import { TripUpdate } from "@/types/tripUpdate";
import { NextRequest, NextResponse } from "next/server";

// GET /api/get_trip_update/
export async function GET(
  request: NextRequest
): Promise<NextResponse<TripUpdate[] | ApiErrorResponse>> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("agency");

    if (!query) {
      const apiErrorResponse: ApiErrorResponse = {
        error: "Agency parameter is required",
        status: 400,
      };
      return NextResponse.json(apiErrorResponse, { status: 400 });
    }

    return NextResponse.json(
      await fetchData(getTripUpdateUrl(query as Agency)),
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
