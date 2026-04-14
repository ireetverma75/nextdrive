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

    await cloudinary.uploader.destroy(file.publicId);
    await db.delete(files).where(eq(files.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
