import { getIcon } from "@/lib/iconApi";
import { Agency } from "@/types/agency";
import { ApiErrorResponse } from "@/types/apiErrorResponse";
import { Icon } from "@/types/icon";
import { NextRequest, NextResponse } from "next/server";

// GET /api/get_icon/
export async function GET(
  request: NextRequest
): Promise<NextResponse<Icon[] | ApiErrorResponse>> {
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

    return NextResponse.json(await getIcon(query as Agency), { status: 200 });
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
