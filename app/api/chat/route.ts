import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/db";
import Chat from "@/models/Chat";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

// Get all chats for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    await connectToDatabase();
    
    const chats = await Chat.find({ userId: session.user.id })
      .sort({ updatedAt: -1 })
      .select("_id title updatedAt");
    
    return NextResponse.json(chats);
  } catch (error: any) {
    console.error("Error fetching chats:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch chats" },
      { status: 500 }
    );
  }
}

// Create a new chat
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { message } = await request.json();
    
    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    const chat = await Chat.create({
      userId: new mongoose.Types.ObjectId(session.user.id),
      title: "New Chat",
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
    });
    
    return NextResponse.json(chat, { status: 201 });
  } catch (error: any) {
    console.error("Error creating chat:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create chat" },
      { status: 500 }
    );
  }
}