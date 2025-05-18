import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/db";
import Chat from "@/models/Chat";
import { GoogleGenerativeAI } from "@google/generative-ai";
import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Add an AI response to a chat
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

    // Get the chat
    const chat = await Chat.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Initialize Gemini 2.0 Flash model
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // or "gemini-1.5-pro"

    // Format the full conversation history
    const contents = chat.messages.map((msg: { role: string; content: string }) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // Send content for generation
    const result = await model.generateContent({ contents });

    const response = await result.response;
    const aiResponse = response.text();

    // Add Gemini response to chat
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
