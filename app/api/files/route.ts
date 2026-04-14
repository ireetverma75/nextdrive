import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { files } from "@/lib/schema";
import { eq, and, like, desc } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";

    const userFiles = await db.select().from(files)
      .where(and(
        eq(files.uploadedBy, session.user.id),
        like(files.filename, `%${q}%`)
      ))
      .orderBy(desc(files.createdAt));

    return NextResponse.json({ files: userFiles });
  } catch (error: any) {
    console.error("Fetch files error:", error);
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 });
  }
}
