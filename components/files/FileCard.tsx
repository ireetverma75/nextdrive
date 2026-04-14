"use client";
import { Image, FileText, Video, Download, Trash2, Share2, Link as LinkIcon, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { toast } from "sonner";
import { useState } from "react";

export default function FileCard({ file }: { file: any }) {
  const [loading, setLoading] = useState(false);

  const getIcon = () => {
    if (file.fileType.startsWith("image")) return <Image className="text-purple-500" />;
    if (file.fileType === "video/mp4" || file.fileType.startsWith("video")) return <Video className="text-red-500" />;
    return <FileText className="text-blue-500" />;
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/files/${file.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast.success("File deleted");
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
    <div className="group relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 hover:shadow-md hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-200 flex flex-col">
      <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-3">
        {getIcon()}
      </div>
      <h3 className="font-medium truncate text-sm">{file.filename}</h3>
      <p className="text-xs text-gray-500 mb-2">{new Date(file.createdAt).toLocaleDateString()}</p>
      <div className="flex items-center justify-between mt-auto">
        <span className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
        <div className="flex gap-2 transition-opacity">
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
        </div>
      </div>
    </div>
  );
}
