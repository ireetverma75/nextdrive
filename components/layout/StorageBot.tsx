"use client";

import { useEffect, useState, useCallback } from "react";
import { formatBytes } from "@/lib/utils";
import { Bot, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StorageBot() {
  const [totalSize, setTotalSize] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [lastUploadTime, setLastUploadTime] = useState<number>(0);

  const fetchStorage = useCallback(async () => {
    try {
      const res = await fetch("/api/user/storage");
      if (res.ok) {
        const data = await res.json();
        setTotalSize(data.totalSize);
      }
    } catch (error) {
      console.error("Failed to fetch storage", error);
    }
  }, []);

  useEffect(() => {
    fetchStorage();

    const handleUploadComplete = () => {
      fetchStorage();
      setIsOpen(true);
      setShowMessage(true);
      setLastUploadTime(Date.now());
      
      // Auto close message after 5 seconds if no interaction
      setTimeout(() => {
        setShowMessage(false);
      }, 5000);
    };

    window.addEventListener("upload_complete", handleUploadComplete);
    return () => window.removeEventListener("upload_complete", handleUploadComplete);
  }, [fetchStorage]);

  if (totalSize === null) return null;

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) setShowMessage(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl rounded-2xl p-4 mb-4 w-64 transform transition-all duration-300 origin-bottom-right">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-sm">Storage Assistant</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-3 text-sm">
            {showMessage ? (
              <p>
                <span className="font-medium text-green-600 dark:text-green-400">File saved!</span><br/>
                Your total memory usage is now <strong>{formatBytes(totalSize)}</strong>.
              </p>
            ) : (
              <p>
                You are currently using <strong>{formatBytes(totalSize)}</strong> of storage.
              </p>
            )}
          </div>
        </div>
      )}

      <Button
        onClick={toggleOpen}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`rounded-full h-14 w-14 shadow-lg transition-all duration-300 ${isOpen ? 'bg-zinc-200 hover:bg-zinc-300 text-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
      >
        <Bot className={`w-6 h-6 transition-transform duration-300 ${isHovered && !isOpen ? 'scale-110' : ''}`} />
      </Button>
    </div>
  );
}
