import { NextResponse } from "next/server";
import { generateServerHtml } from "@/editor/utils/generateServerHtml";

export async function POST(request: Request) {
  try {
    console.log("Embed API called");
    const body = await request.json().catch((error) => {
      console.error("Embed API: Error parsing JSON body:", error);
      return null;
    });

    if (!body) {
      console.error("Embed API: Invalid request - no body");
      return NextResponse.json({
        error: {
          title: "Invalid request",
          subtitle: "Please try again later",
        },
      }, { status: 400 });
    }

    console.log("Embed API: Generating HTML from editor state");
    const html = await generateServerHtml(body);
    console.log("Embed API: HTML generated successfully");

    if (!html) {
      console.error("Embed API: Failed to generate HTML - empty result");
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
