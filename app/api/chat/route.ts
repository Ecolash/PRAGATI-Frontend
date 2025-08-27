/* eslint-disable prettier/prettier */
import { NextRequest, NextResponse } from "next/server";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { agriculturalAPI } from "@/lib/agricultural-api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, files, mode = "tooling", turnstileToken } = body;

    // Verify Turnstile token first
    if (!turnstileToken) {
      return NextResponse.json(
        { error: "Security verification required" },
        { status: 400 }
      );
    }

    const isValid = await verifyTurnstileToken(turnstileToken);
    if (!isValid) {
      return NextResponse.json(
        { error: "Security verification failed" },
        { status: 403 }
      );
    }

    // Only after verification, call agricultural API
    console.log("Calling agricultural API...");
    const agentResponse = await agriculturalAPI.getWorkflowAgent({
      query: message,
      mode: mode as "rag" | "tooling",
      image: files?.[0],
    });

    return NextResponse.json(agentResponse);
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
