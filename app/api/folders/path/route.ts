import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { folders } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (!id || id === "null") return NextResponse.json({ path: [] });

    let currentId: string | null = id;
    const path = [];

    // Safeguard to prevent infinite loops (max depth 20)
    let depth = 0;
    while (currentId && depth < 20) {
      const folderSet = await db.select().from(folders).where(eq(folders.id, currentId));
      const folder = folderSet[0];
      
      if (!folder || folder.createdBy !== session.user.id) break;
      
      path.unshift({ id: folder.id, name: folder.name }); // unshift to keep order root -> leaf
      currentId = folder.parentId;
      depth++;
    }

    return NextResponse.json({ path });
  } catch (error) {
    console.error("Fetch path error:", error);
    return NextResponse.json({ error: "Failed to fetch path" }, { status: 500 });
  }
}
