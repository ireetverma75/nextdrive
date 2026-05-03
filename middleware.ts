import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function proxy(req: NextRequest) {
  const token = 
    req.cookies.get("authjs.session-token")?.value || 
    req.cookies.get("__Secure-authjs.session-token")?.value ||
    req.cookies.get("next-auth.session-token")?.value || 
    req.cookies.get("__Secure-next-auth.session-token")?.value;

  
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/preview/:path*"],
};
