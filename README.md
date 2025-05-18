# AI Chat Application

A ChatGPT-like chat application built with Next.js, MongoDB, and Google's Gemini API.

## Features

- User authentication with email/password
- Persistent chat history
- Real-time chat interaction
- Code block formatting with syntax highlighting
- Dark/light mode support
- Mobile responsive design

## Tech Stack

- **Frontend**: Next.js, TailwindCSS, TypeScript
- **Authentication**: NextAuth.js
- **Database**: MongoDB with Mongoose
- **AI API**: Google Gemini API
- **State Management**: React Hooks (useState, useEffect)

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- MongoDB database (Atlas or local)
- Google AI API key (for Gemini)

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
# App
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here

# MongoDB
MONGODB_URI=mongodb+srv://your-mongodb-uri

# Gemini API
GOOGLE_API_KEY=your-google-api-key
```

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ai-chat-app.git
   cd ai-chat-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Deployment

The application is ready for deployment on Vercel:

```bash
npm run build
vercel --prod
```

## Directory Structure

```
├── app/              # Next.js App Router
│   ├── api/          # API routes
│   ├── auth/         # Authentication pages
│   ├── chat/         # Chat page and components
│   ├── components/   # Shared components
│   └── ...
├── lib/              # Utilities and helpers
├── models/           # Mongoose models
├── public/           # Static assets
├── ...
```

## License

This project is licensed under the MIT License.