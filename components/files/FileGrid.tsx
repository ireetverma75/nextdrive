"use client";
import { useEffect, useState } from "react";
import FileCard from "./FileCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function FileGrid() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const fetchFiles = async (q = "") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/files?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setFiles(data.files || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchFiles(); }, []);

  return (
    <div className="p-6">
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <Input placeholder="Search files..." className="pl-9 bg-white dark:bg-gray-900" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && fetchFiles(query)} />
      </div>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-40 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-20 text-gray-500">No files found. Upload your first file!</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.map((file: any) => <FileCard key={file.id} file={file} />)}
        </div>
      )}
    </div>
  );
}
