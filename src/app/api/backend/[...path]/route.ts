import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function proxyRequest(req: NextRequest, { params }: { params: { path: string[] } }) {
  const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:4300/api/backend";
  
  const method = req.method;
  const pathParts = params.path || [];
  const searchParams = req.nextUrl.search;
  const backendUrl = `${BACKEND_URL}/${pathParts.join("/")}${searchParams}`;

  if (method === "OPTIONS") {
    // Handle CORS preflight automatically without hitting the fragile backend
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, Accept",
      },
    });
  }

  // Clone headers but fake the Origin to avoid the backend's 500 error
  const headers = new Headers();
  req.headers.forEach((value, key) => {
    const k = key.toLowerCase();
    if (!["host", "connection", "content-length", "transfer-encoding", "origin", "referer"].includes(k)) {
      headers.set(key, value);
    }
  });
  // The backend crashes when origin is not http://localhost:3000 or identical to expected.
  headers.set("origin", "http://localhost:3000");

  const options: RequestInit = {
    method,
    headers,
    redirect: "manual",
  };

  if (method !== "GET" && method !== "HEAD") {
    options.body = await req.arrayBuffer();
  }

  try {
    const response = await fetch(backendUrl, options);
    const buffer = await response.arrayBuffer();
    
    // Create new headers with CORS override
    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      const k = key.toLowerCase();
      if (!["content-encoding", "content-length", "transfer-encoding", "connection"].includes(k)) {
        responseHeaders.set(key, value);
      }
    });
    
    responseHeaders.set("Access-Control-Allow-Origin", "*");
    
    return new NextResponse(buffer, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: "Proxy fetch error", error: err.message },
      { status: 502 }
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const DELETE = proxyRequest;
export const PATCH = proxyRequest;
export const OPTIONS = proxyRequest;
