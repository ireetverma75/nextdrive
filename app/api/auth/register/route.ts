import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();
    const hashed = await bcrypt.hash(password, 12);
    await db.insert(users).values({ name, email, password: hashed });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("Registration error:", e);
    // mapped to sqlite-specific constraint exception handling
    const isConflict = e.code === "SQLITE_CONSTRAINT" || e.message?.includes("UNIQUE");
    const errorMessage = isConflict 
      ? "Email already exists" 
      : "Failed to register. Check database connection or server logs.";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
