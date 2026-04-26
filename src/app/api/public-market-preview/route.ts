import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const PREVIEW_URL =
  process.env.PUBLIC_MARKET_PREVIEW_URL ??
  "http://34.61.102.74:3000/alpha/api/v1/market/analyze/preview";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const role = typeof body?.role === "string" ? body.role.trim() : "";

    if (!role) {
      return NextResponse.json({ message: "Role is required" }, { status: 400 });
    }

    const upstream = await fetch(PREVIEW_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ role }),
      cache: "no-store",
    });

    const contentType = upstream.headers.get("content-type") ?? "application/json";
    const text = await upstream.text();

    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "Content-Type": contentType,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        message: "Preview proxy fetch error",
        error: err?.message ?? "Unknown error",
      },
      { status: 502 }
    );
  }
}
