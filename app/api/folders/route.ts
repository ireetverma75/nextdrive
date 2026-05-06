import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { folders } from "@/lib/schema";
import { eq, and, isNull } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const parentId = searchParams.get("parentId");
    const tab = searchParams.get("tab") || "home";

    const conditions = [eq(folders.createdBy, session.user.id)];
    
    if (tab === "trash") {
      conditions.push(eq(folders.isTrashed, true));
    } else if (tab === "starred") {
      conditions.push(eq(folders.isTrashed, false));
      conditions.push(eq(folders.isStarred, true));
    } else {
      conditions.push(eq(folders.isTrashed, false));
      if (parentId && parentId !== "null") {
        conditions.push(eq(folders.parentId, parentId));
      } else {
        conditions.push(isNull(folders.parentId));
      }
    }

    const userFolders = await db.select().from(folders).where(and(...conditions));
    return NextResponse.json({ folders: userFolders });
  } catch (error) {
    console.error("Fetch folders error:", error);
    return NextResponse.json({ error: "Failed to fetch folders" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, parentId } = await req.json();
    if (!name) return NextResponse.json({ error: "Folder name is required" }, { status: 400 });

    const newFolders = await db.insert(folders).values({
      name,
      parentId: parentId || null,
      createdBy: session.user.id,
    }).returning();

    return NextResponse.json({ folder: newFolders[0] });
  } catch (error) {
    console.error("Create folder error:", error);
    return NextResponse.json({ error: "Failed to create folder" }, { status: 500 });
  }
}
