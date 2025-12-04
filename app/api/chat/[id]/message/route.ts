import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/db";
import Chat from "@/models/Chat";
import { GoogleGenerativeAI } from "@google/generative-ai";
import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid chat ID" }, { status: 400 });
    }

    await connectToDatabase();

    const chat = await Chat.findOne({ _id: id, userId: session.user.id });
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Ensure API key exists and initialize Gemini client
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server misconfiguration: GOOGLE_API_KEY is missing" },
        { status: 500 }
      );
    }
    const genAI = new GoogleGenerativeAI(apiKey);

    // Use a valid v1beta model name (no "-latest" alias)
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    // Convert your DB messages → Gemini chat history
    const history = chat.messages.map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // Remove any trailing 'user' roles so we don't send consecutive user messages
    while (history.length > 0 && history[history.length - 1].role === "user") {
      history.pop();
    }

    // Get user's latest message from request body (handle invalid/empty JSON)
    let bodyText = await request.text();
    if (!bodyText || bodyText.trim().length === 0) {
      return NextResponse.json(
        { error: "Invalid JSON body: empty" },
        { status: 400 }
      );
    }

    let body: any;
    try {
      body = JSON.parse(bodyText);
    } catch (err) {
      console.error("Invalid JSON body:", err);
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const message = typeof body?.message === "string" ? body.message.trim() : "";
    if (!message) {
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
    }

    // Start a chat session with the cleaned history (do NOT pre-append the current user message)
    const chatSession = model.startChat({ history });

    // Send the user message to Gemini
    let result;
    try {
      result = await chatSession.sendMessage(message);
    } catch (err) {
      console.error("Gemini error:", err);
      throw err;
    }

    const aiResponse = result.response.text();

    // Save user message
    chat.messages.push({
      role: "user",
      content: message,
      createdAt: new Date(),
    });

    // Save AI response
    chat.messages.push({
      role: "assistant",
      content: aiResponse,
      createdAt: new Date(),
    });

    await chat.save();

    return NextResponse.json({ response: aiResponse });
  } catch (error: any) {
    console.error("Error generating AI response:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate AI response" },
      { status: 500 }
    );
  }
}
