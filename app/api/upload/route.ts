import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { files } from "@/lib/schema";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as any | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "nextdrive", resource_type: "auto", public_id: `${Date.now()}_${file.name}` },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    let fileType = result.resource_type === "raw" ? file.type : `${result.resource_type}/${result.format}`;
    if (result.resource_type === "video") {
      fileType = result.format === "mp4" ? "video/mp4" : "video/" + result.format;
    }

    const newFiles = await db.insert(files).values({
      filename: file.name,
      fileUrl: result.secure_url,
      fileType: fileType,
      size: result.bytes,
      publicId: result.public_id,
      uploadedBy: session.user.id
    }).returning();

    return NextResponse.json({ file: newFiles[0] });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
