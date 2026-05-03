"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function UploadModal() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (accepted) => setFile(accepted[0]),
    maxSize: 100 * 1024 * 1024,
    maxFiles: 1,
    disabled: uploading,
  });

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    abortControllerRef.current = new AbortController();

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { 
        method: "POST", 
        body: formData,
        signal: abortControllerRef.current.signal
      });
      if (!res.ok) throw new Error();
      toast.success("Uploaded successfully");
      handleClose();
      
      // Notify StorageBot and refresh Server Components
      window.dispatchEvent(new Event("upload_complete"));
      router.refresh();
    } catch (err: any) {
      if (err.name === "AbortError") {
        toast.info("Upload cancelled");
      } else {
        toast.error("Upload failed");
      }
    } finally { 
      setUploading(false); 
      abortControllerRef.current = null;
    }
  };

  const handleClose = () => {
    if (uploading && abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setFile(null);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen ? handleClose() : setOpen(true)}>
      <DialogTrigger render={<Button className="bg-blue-600 hover:bg-blue-700 text-white" />}>
        <Upload size={16} className="mr-2" /> Upload
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
        </DialogHeader>
        <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isDragActive ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300 dark:border-gray-700"}`}>
          <input {...getInputProps()} />
          {file ? (
            <div className="flex flex-col items-center gap-2">
              <p className="text-blue-600 font-medium">{file.name}</p>
              <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700 h-8" disabled={uploading} onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                Clear File Selection
              </Button>
            </div>
          ) : isDragActive ? (
            <p>Drop here...</p>
          ) : (
            <p>Drag & drop or click to select</p>
          )}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleUpload} disabled={!file || uploading}>
            {uploading ? "Uploading..." : "Confirm"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
