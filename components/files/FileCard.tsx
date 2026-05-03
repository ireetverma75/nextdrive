"use client";
import { Image, FileText, Video, Download, Trash2, Share2, Link as LinkIcon, Mail, MessageCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { toast } from "sonner";
import { useState } from "react";

export default function FileCard({ file, tab = "home" }: { file: any, tab?: string }) {
  const [loading, setLoading] = useState(false);

  const getIcon = () => {
    if (file.fileType.startsWith("image")) return <Image className="text-purple-500" />;
    if (file.fileType === "video/mp4" || file.fileType.startsWith("video")) return <Video className="text-red-500" />;
    return <FileText className="text-blue-500" />;
  };

  const handleRestore = async (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/files/${file.id}`, { method: "PATCH", body: JSON.stringify({ action: "restore" }) });
      if (!res.ok) throw new Error("Failed");
      toast.success("File restored");
      window.location.reload();
    } catch {
      toast.error("Restore failed");
    } finally { setLoading(false); }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = tab === "trash" ? `/api/files/${file.id}?permanent=true` : `/api/files/${file.id}`;
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast.success(tab === "trash" ? "File permanently deleted" : "File moved to trash");
      window.location.reload();
    } catch {
      toast.error("Delete failed");
    } finally { setLoading(false); }
  };

  const handleCopyLink = () => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/preview/${file.id}` : "";
    navigator.clipboard.writeText(url);
    toast.success("Link copied!");
  };

  const handleShareWhatsApp = () => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/preview/${file.id}` : "";
    window.open(`https://wa.me/?text=${encodeURIComponent("Check out my file on NextDrive: " + url)}`, "_blank");
  };

  const handleShareEmail = () => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/preview/${file.id}` : "";
    window.location.href = `mailto:?subject=File on NextDrive&body=${encodeURIComponent("Check out this file on NextDrive: " + url)}`;
  };

  return (
    <div className="group relative bg-white/50 dark:bg-black/40 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-xl p-4 shadow-lg hover:shadow-2xl hover:bg-white/60 dark:hover:bg-black/50 hover:-translate-y-1 transition-all duration-300 flex flex-col">
      <div className="h-32 bg-white/50 dark:bg-white/5 shadow-inner backdrop-blur-sm rounded-lg flex items-center justify-center mb-3">
        {getIcon()}
      </div>
      <h3 className="font-medium truncate text-sm">{file.filename}</h3>
      <p className="text-xs text-gray-500 mb-2">{new Date(file.createdAt).toLocaleDateString()}</p>
      <div className="flex items-center justify-between mt-auto">
        <span className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
        <div className="flex gap-2 transition-opacity">
          {tab === "trash" ? (
            <>
              <Button size="icon" variant="ghost" className="h-7 w-7 text-green-500" onClick={handleRestore} disabled={loading}>
                <RotateCcw size={14} />
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500" onClick={handleDelete} disabled={loading}>
                <Trash2 size={14} />
              </Button>
            </>
          ) : (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button size="icon" variant="ghost" className="h-7 w-7" />}>
                  <Share2 size={14} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={handleCopyLink}><LinkIcon size={16} className="mr-2" /> Copy Link</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleShareWhatsApp}><MessageCircle size={16} className="mr-2 text-green-500" /> WhatsApp</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleShareEmail}><Mail size={16} className="mr-2 text-blue-500" /> Email</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Link href={`/preview/${file.id}`}>
                <Button size="icon" variant="ghost" className="h-7 w-7">👁</Button>
              </Link>
              <a href={file.fileUrl} download target="_blank">
                <Button size="icon" variant="ghost" className="h-7 w-7"><Download size={14} /></Button>
              </a>
              <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500" onClick={handleDelete} disabled={loading}>
                <Trash2 size={14} />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
