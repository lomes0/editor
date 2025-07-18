import { NextResponse } from "next/server";
import { generateServerHtml } from "@/editor/utils/generateServerHtml";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch((error) => {
      return null;
    });

    if (!body) {
      return NextResponse.json({
        error: {
          title: "Invalid request",
          subtitle: "Please try again later",
        },
      }, { status: 400 });
    }

    const html = await generateServerHtml(body);

    if (!html) {
      return NextResponse.json({
        error: {
          title: "Failed to generate HTML",
          subtitle: "Please try again later",
        },
      }, { status: 500 });
    }

    return new Response(html, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    console.error("Embed API error:", error);
    return NextResponse.json({
      error: {
        title: "Something went wrong",
        subtitle: "Please try again later",
      },
    }, { status: 500 });
  }
}
