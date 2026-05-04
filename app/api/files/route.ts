import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { files } from "@/lib/schema";
import { eq, and, like, desc, isNull, or } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || !session.user.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const tab = searchParams.get("tab") || "home";
    const folderId = searchParams.get("folderId");
    const category = searchParams.get("category");

    const conditions = [
      eq(files.uploadedBy, session.user.id),
      like(files.filename, `%${q}%`)
    ];

    if (category === "image") conditions.push(like(files.fileType, "image/%"));
    else if (category === "video") conditions.push(like(files.fileType, "video/%"));
    else if (category === "pdf") conditions.push(eq(files.fileType, "application/pdf"));
    else if (category === "document") conditions.push(
      or(
        like(files.fileType, "text/%"),
        like(files.fileType, "application/vnd.openxmlformats-officedocument.%"),
        eq(files.fileType, "application/msword")
      )
    );

    if (tab === "trash") {
      conditions.push(eq(files.isTrashed, true));
    } else {
      conditions.push(eq(files.isTrashed, false));
      if (!q && !category) {
        if (folderId && folderId !== "null") {
          conditions.push(eq(files.folderId, folderId));
        } else {
          conditions.push(isNull(files.folderId));
        }
      } else if (folderId && folderId !== "null") {
        conditions.push(eq(files.folderId, folderId));
      }
    }

    const userFiles = await db.select().from(files)
      .where(and(...conditions))
      .orderBy(desc(files.createdAt));

    return NextResponse.json({ files: userFiles });
  } catch (error: any) {
    console.error("Fetch files error:", error);
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 });
  }
}
