"use client";
import { useEffect, useState, useCallback } from "react";
import FileCard from "./FileCard";
import { Input } from "@/components/ui/input";
import { Search, Folder, Plus, Upload as UploadIcon, Loader2, Trash2, RotateCcw, ChevronRight, LayoutGrid, List, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

export default function FileGrid({ tab = "home" }: { tab?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const folderId = searchParams.get("folderId");
  const category = searchParams.get("category");
  
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [breadcrumbs, setBreadcrumbs] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Folder editing state
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const fetchData = useCallback(async (q = "") => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ q, tab });
      if (folderId) qs.append("folderId", folderId);
      if (category) qs.append("category", category);
      
      const [filesRes, foldersRes, pathRes] = await Promise.all([
        fetch(`/api/files?${qs.toString()}`),
        !q && !category ? fetch(`/api/folders?parentId=${folderId || ""}&tab=${tab}`) : Promise.resolve({ json: () => ({ folders: [] }) }),
        !q && !category && folderId && tab === "home" ? fetch(`/api/folders/path?id=${folderId}`) : Promise.resolve({ json: () => ({ path: [] }) })
      ]);
      
      const filesData = await filesRes.json();
      const foldersData = !q && !category ? await foldersRes.json() : { folders: [] };
      const pathData = folderId ? await pathRes.json() : { path: [] };
      
      setFiles(filesData.files || []);
      setFolders(foldersData.folders || []);
      setBreadcrumbs(pathData.path || []);
    } finally { 
      setLoading(false); 
    }
  }, [tab, folderId, category]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchData(query);
    }, 300);
    return () => clearTimeout(timeout);
  }, [query, fetchData]);

  const handleUpload = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    
    setUploading(true);
    setUploadProgress(0);
    const formData = new FormData();
    formData.append("file", file);
    if (folderId) formData.append("folderId", folderId);

    try {
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/upload", true);
        
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            setUploadProgress(Math.round(percentComplete));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(xhr.response);
          } else {
            reject(new Error("Upload failed"));
          }
        };

        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.send(formData);
      });

      toast.success("Uploaded successfully");
      window.dispatchEvent(new Event("upload_complete"));
      fetchData(query);
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleUpload,
    noClick: true,
    disabled: uploading || tab !== "home"
  });

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    
    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newFolderName, parentId: folderId })
      });
      if (!res.ok) throw new Error();
      setNewFolderName("");
      setCreatingFolder(false);
      fetchData(query);
    } catch (err) {
      toast.error("Failed to create folder");
    }
  };

  const handleRenameFolder = async (id: string) => {
    if (!editingName.trim() || !editingFolderId) {
      setEditingFolderId(null);
      return;
    }
    try {
      const res = await fetch(`/api/folders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rename", name: editingName })
      });
      if (res.ok) {
        toast.success("Folder renamed");
        fetchData(query);
      }
    } catch {
      toast.error("Rename failed");
    } finally {
      setEditingFolderId(null);
    }
  };

  const handleDeleteFolder = async (e: React.MouseEvent, id: string, permanent: boolean = false) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/folders/${id}?permanent=${permanent}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(permanent ? "Folder deleted" : "Folder moved to trash");
        fetchData(query);
      }
    } catch {
      toast.error("Failed to delete folder");
    }
  };

  const handleRestoreFolder = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/folders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore" })
      });
      if (res.ok) {
        toast.success("Folder restored");
        fetchData(query);
      }
    } catch {
      toast.error("Failed to restore folder");
    }
  };

  const handleToggleFolderStar = async (e: React.MouseEvent, folder: any) => {
    e.stopPropagation();
    try {
      const action = folder.isStarred ? "unstar" : "star";
      const res = await fetch(`/api/folders/${folder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        toast.success(folder.isStarred ? "Removed from Starred" : "Added to Starred");
        fetchData(query);
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleFileDropToFolder = async (e: React.DragEvent, targetFolderId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const fileId = e.dataTransfer.getData("fileId");
    if (!fileId) return;

    try {
      const res = await fetch(`/api/files/${fileId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "move", folderId: targetFolderId || null })
      });
      if (res.ok) {
        toast.success("File moved successfully");
        fetchData(query);
      }
    } catch {
      toast.error("Failed to move file");
    }
  };

  return (
    <div {...getRootProps()} className={`min-h-full p-6 transition-colors ${isDragActive ? "bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl" : ""}`}>
      <input {...getInputProps()} />
      
      {isDragActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-500/20 backdrop-blur-sm border-4 border-dashed border-blue-500 rounded-3xl m-4 pointer-events-none">
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-2xl flex flex-col items-center">
            <UploadIcon className="w-12 h-12 text-blue-500 mb-4 animate-bounce" />
            <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400">Drop files to upload</h2>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <Input 
              placeholder="Search files..." 
              className="pl-9 bg-white/20 dark:bg-black/20 backdrop-blur-lg border border-white/30 dark:border-white/10 shadow-sm focus-visible:ring-white/50 transition-all rounded-xl" 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
            />
          </div>
          
          {tab === "home" && !query && (
            <div className="flex items-center flex-1 overflow-x-auto whitespace-nowrap scrollbar-hide bg-white/30 dark:bg-black/20 px-3 py-1.5 rounded-lg border border-white/40 dark:border-white/10">
               {category ? (
                 <div className="font-medium text-blue-600 dark:text-blue-400 capitalize p-1">
                   {category === "pdf" ? "PDFs" : `${category}s`}
                 </div>
               ) : (
                 <>
                   <div 
                     onDragOver={(e) => e.preventDefault()}
                     onDrop={(e) => handleFileDropToFolder(e, "")}
                     onClick={() => router.push('/dashboard')}
                     className="cursor-pointer font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1"
                   >
                     Home
                   </div>
                   {breadcrumbs.map((crumb, idx) => (
                      <div key={crumb.id} className="flex items-center">
                        <ChevronRight size={16} className="text-gray-400 mx-1" />
                        <div
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => handleFileDropToFolder(e, crumb.id)}
                          onClick={() => router.push(`/dashboard?folderId=${crumb.id}`)}
                          className={`cursor-pointer font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1 ${idx === breadcrumbs.length - 1 ? "text-blue-600 dark:text-blue-400" : ""}`}
                        >
                          {crumb.name}
                        </div>
                      </div>
                   ))}
                 </>
               )}
            </div>
          )}
        </div>
        
        {tab === "home" && !query && (
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white/20 dark:bg-black/20 rounded-lg p-1 border border-white/30 dark:border-white/10 mr-2">
              <Button variant="ghost" size="sm" className={`h-8 w-8 p-0 ${viewMode === 'grid' ? 'bg-white/50 dark:bg-white/10 shadow-sm' : ''}`} onClick={() => setViewMode('grid')}>
                <LayoutGrid size={16} />
              </Button>
              <Button variant="ghost" size="sm" className={`h-8 w-8 p-0 ${viewMode === 'list' ? 'bg-white/50 dark:bg-white/10 shadow-sm' : ''}`} onClick={() => setViewMode('list')}>
                <List size={16} />
              </Button>
            </div>
            {creatingFolder ? (
              <form onSubmit={handleCreateFolder} className="flex items-center gap-2">
                <Input 
                  autoFocus 
                  placeholder="Folder name" 
                  value={newFolderName} 
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="h-9 w-40"
                />
                <Button type="submit" size="sm">Create</Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setCreatingFolder(false)}>Cancel</Button>
              </form>
            ) : (
              <Button variant="outline" onClick={() => setCreatingFolder(true)}>
                <Plus size={16} className="mr-2" /> New Folder
              </Button>
            )}
          </div>
        )}
      </div>

      {uploading && (
        <div className="flex flex-col gap-2 mb-6 bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30 max-w-sm">
          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
            <div className="flex items-center gap-2">
              <Loader2 className="animate-spin" size={16} />
              <span className="text-sm font-medium">Uploading file...</span>
            </div>
            {uploadProgress !== null && <span className="text-sm font-bold">{uploadProgress}%</span>}
          </div>
          {uploadProgress !== null && (
            <div className="w-full bg-blue-100 dark:bg-blue-950 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-40 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : files.length === 0 && folders.length === 0 && !query ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-white/10 dark:bg-black/10 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
          <UploadIcon className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">This folder is empty</h3>
          <p className="text-sm mt-1">Drag and drop files here or create a new folder</p>
        </div>
      ) : (
        <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" : "flex flex-col gap-2"}>
          {folders.map((folder: any) => (
            <div 
              key={folder.id} 
              onDragOver={(e) => {
                if (tab !== "trash") e.preventDefault();
              }}
              onDrop={(e) => {
                if (tab !== "trash") handleFileDropToFolder(e, folder.id);
              }}
              onClick={() => {
                if (tab !== "trash" && editingFolderId !== folder.id) {
                  router.push(`/dashboard?folderId=${folder.id}`);
                }
              }}
              onDoubleClick={(e) => {
                if (tab !== "trash") {
                  e.stopPropagation();
                  setEditingFolderId(folder.id);
                  setEditingName(folder.name);
                }
              }}
              className={`group relative flex items-center p-4 bg-white/40 dark:bg-black/30 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer hover:bg-white/60 dark:hover:bg-black/50 ${viewMode === 'grid' ? 'flex-col justify-center aspect-square' : 'flex-row gap-4 h-16'}`}
            >
              {tab === "trash" ? (
                 <div className={`absolute flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${viewMode === 'grid' ? 'top-2 right-2' : 'right-4'}`}>
                   <Button size="icon" variant="ghost" className="h-7 w-7 text-green-500 hover:bg-green-100 dark:hover:bg-green-900/30" onClick={(e) => handleRestoreFolder(e, folder.id)}>
                     <RotateCcw size={14} />
                   </Button>
                   <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30" onClick={(e) => handleDeleteFolder(e, folder.id, true)}>
                     <Trash2 size={14} />
                   </Button>
                 </div>
              ) : (
                 <div className={`absolute flex gap-1 transition-opacity ${folder.isStarred ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} ${viewMode === 'grid' ? 'top-2 right-2' : 'right-4'}`}>
                   <Button size="icon" variant="ghost" className={`h-7 w-7 ${folder.isStarred ? "text-yellow-500" : ""}`} onClick={(e) => handleToggleFolderStar(e, folder)}>
                     <Star size={14} className={folder.isStarred ? "fill-yellow-500" : ""} />
                   </Button>
                   <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => handleDeleteFolder(e, folder.id)}>
                     <Trash2 size={14} />
                   </Button>
                 </div>
              )}

              <div className={`bg-blue-100 dark:bg-blue-900/30 rounded-full group-hover:scale-110 transition-transform duration-300 flex items-center justify-center ${viewMode === 'grid' ? 'p-4 mb-3' : 'w-10 h-10'}`}>
                <Folder className="text-blue-500 fill-blue-500/20" size={viewMode === 'grid' ? 32 : 20} />
              </div>
              
              {editingFolderId === folder.id ? (
                <Input
                  autoFocus
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={() => handleRenameFolder(folder.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRenameFolder(folder.id);
                    if (e.key === "Escape") setEditingFolderId(null);
                  }}
                  className={`h-8 px-1 text-sm font-medium ${viewMode === 'grid' ? 'text-center' : 'w-64'}`}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className={`font-medium truncate ${viewMode === 'grid' ? 'w-full text-center px-2' : 'flex-1 text-left'}`}>{folder.name}</span>
              )}
            </div>
          ))}
          {files.map((file: any) => <FileCard key={file.id} file={file} tab={tab} viewMode={viewMode} />)}
        </div>
      )}
    </div>
  );
}
