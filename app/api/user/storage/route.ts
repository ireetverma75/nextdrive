import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { files } from "@/lib/schema";
import { eq, and, sum } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await db
      .select({ totalSize: sum(files.size) })
      .from(files)
      .where(and(eq(files.uploadedBy, session.user.id), eq(files.isTrashed, false)));

    const totalSize = result[0]?.totalSize || 0;

    return NextResponse.json({ totalSize: Number(totalSize) });
  } catch (error: any) {
    console.error("Storage fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch storage usage" }, { status: 500 });
  }
}
