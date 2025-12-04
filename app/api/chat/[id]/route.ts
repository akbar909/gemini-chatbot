import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/db";
import Chat from "@/models/Chat";
import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Get a specific chat by ID
export async function GET(
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
      return NextResponse.json(
        { error: "Invalid chat ID" },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    const chat = await Chat.findOne({
      _id: id,
      userId: session.user.id,
    }).lean();
    
    if (!chat) {
      return NextResponse.json(
        { error: "Chat not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(chat);
  } catch (error: any) {
    console.error("Error fetching chat:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch chat" },
      { status: 500 }
    );
  }
}

// Update a chat (add a message)
export async function PATCH(
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
      return NextResponse.json(
        { error: "Invalid chat ID" },
        { status: 400 }
      );
    }
    
    const { message } = await request.json();
    
    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    const chat = await Chat.findOneAndUpdate(
      {
        _id: id,
        userId: session.user.id,
      },
      {
        $push: {
          messages: {
            role: "user",
            content: message,
          },
        },
      },
      { new: true }
    );
    
    if (!chat) {
      return NextResponse.json(
        { error: "Chat not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(chat);
  } catch (error: any) {
    console.error("Error updating chat:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update chat" },
      { status: 500 }
    );
  }
}

// Delete a chat
export async function DELETE(
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
      return NextResponse.json(
        { error: "Invalid chat ID" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const result = await Chat.deleteOne({
      _id: id,
      userId: session.user.id,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Chat not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting chat:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete chat" },
      { status: 500 }
    );
  }
}