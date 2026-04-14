"use client";
import { useEffect, useState } from "react";
import { ArrowLeft, Download, Trash2, Share2, Link as LinkIcon, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function PreviewPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [file, setFile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/files`)
      .then(res => res.json())
      .then(data => {
        const f = data.files.find((f: any) => f.id === id);
        setFile(f);
        setLoading(false);
      });
  }, [id]);

  const handleDelete = async () => {
    const res = await fetch(`/api/files/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Deleted"); router.push("/dashboard"); }
  };

  const handleCopyLink = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    navigator.clipboard.writeText(url);
    toast.success("Link copied!");
  };

  const handleShareWhatsApp = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    window.open(`https://wa.me/?text=${encodeURIComponent("Check out my file on NextDrive: " + url)}`, "_blank");
  };

  const handleShareEmail = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    window.location.href = `mailto:?subject=File on NextDrive&body=${encodeURIComponent("Check out this file on NextDrive: " + url)}`;
  };


  if (loading) return <div className="p-8 text-center">Loading preview...</div>;
  if (!file) return <div className="p-8 text-center">File not found</div>;

  const isImage = file.fileType.startsWith("image");
  const isVideo = file.fileType.startsWith("video") || file.fileType === "video/mp4";
  const isPdf = file.fileType.includes("pdf");

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <header className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <Link href="/dashboard" className="flex items-center gap-2 hover:text-blue-600 transition-colors">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <h1 className="font-medium truncate max-w-xs">{file.filename}</h1>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline"><Share2 size={16} className="mr-2"/>Share</Button>} />
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleCopyLink}><LinkIcon size={16} className="mr-2" /> Copy Link</DropdownMenuItem>
              <DropdownMenuItem onClick={handleShareWhatsApp}><MessageCircle size={16} className="mr-2 text-green-500" /> WhatsApp</DropdownMenuItem>
              <DropdownMenuItem onClick={handleShareEmail}><Mail size={16} className="mr-2 text-blue-500" /> Email</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" onClick={() => window.open(file.fileUrl, "_blank")}><Download size={16} className="mr-2"/>Download</Button>
          <Button variant="destructive" onClick={handleDelete}><Trash2 size={16} className="mr-2"/>Delete</Button>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-6 bg-gray-100 dark:bg-gray-950">
        <div className="w-full max-w-5xl h-[70vh] bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden border">
          {isImage && <img src={file.fileUrl} alt={file.filename} className="w-full h-full object-contain" />}
          {isVideo && <video src={file.fileUrl} controls className="w-full h-full object-contain bg-black" />}
          {isPdf && <iframe src={file.fileUrl} className="w-full h-full border-0" />}
          {!isImage && !isVideo && !isPdf && (
            <div className="w-full h-full flex items-center justify-center flex-col gap-4">
              <p>Preview not available for this format</p>
              <Button onClick={() => window.open(file.fileUrl, "_blank")}>Open File</Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
