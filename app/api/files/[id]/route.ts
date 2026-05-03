import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { files } from "@/lib/schema";
import cloudinary from "@/lib/cloudinary";
import { eq } from "drizzle-orm";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const fileSet = await db.select().from(files).where(eq(files.id, id));
    const file = fileSet[0];
    
    if (!file || file.uploadedBy !== session.user.id) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const permanent = searchParams.get("permanent") === "true";

    if (permanent || file.isTrashed) {
      await cloudinary.uploader.destroy(file.publicId);
      await db.delete(files).where(eq(files.id, id)).returning();
    } else {
      await db.update(files).set({ isTrashed: true }).where(eq(files.id, id)).returning();
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
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { action } = await req.json();

    const fileSet = await db.select().from(files).where(eq(files.id, id));
    const file = fileSet[0];
    
    if (!file || file.uploadedBy !== session.user.id) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    if (action === "restore") {
      await db.update(files).set({ isTrashed: false }).where(eq(files.id, id)).returning();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Restore failed" }, { status: 500 });
  }
}
