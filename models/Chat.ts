import mongoose from 'mongoose';

export interface MessageDocument extends mongoose.Document {
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

export interface ChatDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  messages: MessageDocument[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ChatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      default: 'New Chat',
    },
    messages: [MessageSchema],
  },
  { timestamps: true }
);

// Helpful indexes for faster lookups and sorting
ChatSchema.index({ userId: 1, updatedAt: -1 });

// Create a title based on the first user message if no title is provided
ChatSchema.pre('save', function (next) {
  const chat = this as ChatDocument;
  
  if (chat.title === 'New Chat' && chat.messages.length > 0) {
    const firstUserMessage = chat.messages.find(msg => msg.role === 'user');
    
    if (firstUserMessage) {
      // Limit title to 30 characters
      let title = firstUserMessage.content.substring(0, 30);
      
      // If we had to truncate, add ellipsis
      if (firstUserMessage.content.length > 30) {
        title += '...';
      }
      
      chat.title = title;
    }
  }
  
  next();
});

export default mongoose.models.Chat || mongoose.model<ChatDocument>('Chat', ChatSchema);