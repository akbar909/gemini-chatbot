import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-muted">
      <header className="container mx-auto py-6 px-4 flex justify-between items-center">
        <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text">
          AI Chat
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/auth/login">
            <Button variant="outline">Login</Button>
          </Link>
          <Link href="/auth/register">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12 md:py-24 flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">
          Chat with <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text">AI Assistant</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground max-w-[800px] mb-12">
          Experience intelligent conversations powered by Google&apos;s Gemini AI. Ask questions, get code examples, brainstorm ideas, and more.
        </p>
        
        <div className="grid gap-6 md:grid-cols-3 w-full max-w-[1000px] mb-12">
          <div className="flex flex-col bg-card p-6 rounded-lg shadow-sm border border-border">
            <div className="mb-4 bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Ask Anything</h3>
            <p className="text-muted-foreground">
              Get answers to your questions about any topic, from history to science to everyday life.
            </p>
          </div>
          
          <div className="flex flex-col bg-card p-6 rounded-lg shadow-sm border border-border">
            <div className="mb-4 bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="m18 16 4-4-4-4" />
                <path d="m6 8-4 4 4 4" />
                <path d="m14.5 4-5 16" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Get Code Help</h3>
            <p className="text-muted-foreground">
              Receive code examples, explanations, and guidance across various programming languages.
            </p>
          </div>
          
          <div className="flex flex-col bg-card p-6 rounded-lg shadow-sm border border-border">
            <div className="mb-4 bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Save Conversations</h3>
            <p className="text-muted-foreground">
              All your conversations are automatically saved, so you can revisit them anytime.
            </p>
          </div>
        </div>
        
        <div className="w-full max-w-[800px] relative bg-card rounded-xl overflow-hidden border border-border shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 pointer-events-none" />
          <div className="px-6 py-4 border-b border-border flex justify-between items-center">
            <div className="text-sm font-medium">Chat</div>
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold">U</span>
              </div>
              <div className="flex-1 bg-secondary/50 p-4 rounded-lg rounded-tl-none">
                <p>How do I create a responsive grid layout in CSS?</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold">AI</span>
              </div>
              <div className="flex-1 bg-muted p-4 rounded-lg rounded-tl-none">
                <p className="mb-4">
                  You can create a responsive grid layout using CSS Grid. Here&apos;s an example:
                </p>
                <div className="bg-card p-3 rounded border border-border font-mono text-sm mb-2">
                  <pre><code>{`.container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  grid-gap: 1rem;
}`}</code></pre>
                </div>
                <p>
                  This creates a grid where each column is at least 250px wide, and as many columns fit in the available space.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-12">
          <Link href="/auth/register">
            <Button size="lg" className="text-lg px-8">
              Try it Now
            </Button>
          </Link>
        </div>
      </main>

      <footer className="border-t border-border py-6">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-muted-foreground mb-4 md:mb-0">
            © 2025 AI Chat. All rights reserved.
          </div>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}