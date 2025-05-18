import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = await getToken({ req });
  const { pathname } = req.nextUrl;

  // If user is logged in, redirect to /chat
  if (token && pathname === "/") {
    return NextResponse.redirect(new URL("/chat", req.url));
  }

  // If user is not logged in and tries to access /chat, redirect to /
  if (!token && pathname.startsWith("/chat")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/chat/:path*"],
};