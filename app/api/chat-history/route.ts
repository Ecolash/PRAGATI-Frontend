/* eslint-disable prettier/prettier */
import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/actions/getUser";
import { chatHistoryService } from "@/lib/chat-history";

export async function GET() {
  try {
    const { user } = await getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const chatSessions = await chatHistoryService.loadUserChatSessions(user.id);

    return NextResponse.json({
      success: true,
      chatSessions,
    });
  } catch (error) {
    console.error("Failed to load chat history:", error);
    return NextResponse.json(
      { error: "Failed to load chat history" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, agentId, agentName, language, messages } = body;

    if (!id || !title || !messages) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await chatHistoryService.saveChatSession({
      id,
      title,
      agentId,
      agentName,
      language: language || "en",
      messages,
      userId: user.id,
    });

    return NextResponse.json({
      success: true,
      message: "Chat session saved successfully",
    });
  } catch (error) {
    console.error("Failed to save chat session:", error);
    return NextResponse.json(
      { error: "Failed to save chat session" },
      { status: 500 }
    );
  }
}
