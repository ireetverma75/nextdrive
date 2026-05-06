import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { folders } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const folderSet = await db.select().from(folders).where(eq(folders.id, id));
    const folder = folderSet[0];
    
    if (!folder || folder.createdBy !== session.user.id) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const permanent = searchParams.get("permanent") === "true";

    if (permanent || folder.isTrashed) {
      await db.delete(folders).where(eq(folders.id, id)).returning();
    } else {
      await db.update(folders).set({ isTrashed: true }).where(eq(folders.id, id)).returning();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { action, name } = await req.json();

    const folderSet = await db.select().from(folders).where(eq(folders.id, id));
    const folder = folderSet[0];
    
    if (!folder || folder.createdBy !== session.user.id) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    if (action === "restore") {
      await db.update(folders).set({ isTrashed: false }).where(eq(folders.id, id)).returning();
    } else if (action === "rename" && name) {
      await db.update(folders).set({ name }).where(eq(folders.id, id)).returning();
    } else if (action === "star") {
      await db.update(folders).set({ isStarred: true }).where(eq(folders.id, id)).returning();
    } else if (action === "unstar") {
      await db.update(folders).set({ isStarred: false }).where(eq(folders.id, id)).returning();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
