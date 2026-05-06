"use client";
import Link from "next/link";
import { HardDrive, Share2, Trash2, LayoutGrid, LogOut, Moon, Sun, FileText, Image as ImageIcon, Video, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { formatBytes } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

const navItems = [
  { name: "Home", icon: LayoutGrid, href: "/dashboard" },
  { name: "Documents", icon: FileText, href: "/dashboard?category=document" },
  { name: "Images", icon: ImageIcon, href: "/dashboard?category=image" },
  { name: "Videos", icon: Video, href: "/dashboard?category=video" },
  { name: "PDFs", icon: File, href: "/dashboard?category=pdf" },
  { name: "Shared", icon: Share2, href: "/dashboard?tab=shared" },
  { name: "Trash", icon: Trash2, href: "/dashboard?tab=trash" },
];

export default function Sidebar() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [totalSize, setTotalSize] = useState<number>(0);

  const MAX_STORAGE = 1024 * 1024 * 1024; // 1 GB
  const storagePercentage = Math.min((totalSize / MAX_STORAGE) * 100, 100);

  const fetchStorage = useCallback(async () => {
    try {
      const res = await fetch("/api/user/storage");
      if (res.ok) {
        const data = await res.json();
        setTotalSize(data.totalSize || 0);
      }
    } catch (error) {
      console.error("Failed to fetch storage", error);
    }
  }, []);

  useEffect(() => { 
    setMounted(true);
    fetchStorage();
    const handleUploadComplete = () => fetchStorage();
    window.addEventListener("upload_complete", handleUploadComplete);
    return () => window.removeEventListener("upload_complete", handleUploadComplete);
  }, [fetchStorage]);

  const searchParams = useSearchParams();
  const category = searchParams?.get("category");
  const tab = searchParams?.get("tab");

  return (
    <aside className="w-64 border-r border-white/20 dark:border-white/10 h-screen flex flex-col p-4 bg-white/40 dark:bg-black/30 backdrop-blur-2xl shadow-2xl z-20 relative">
      <h1 className="text-xl font-bold mb-6 flex items-center gap-2">
        <HardDrive className="text-blue-600" /> NextDrive
      </h1>
      
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = 
            (item.name === "Home" && !category && !tab) || 
            (category && item.href.includes(`category=${category}`)) || 
            (tab && item.href.includes(`tab=${tab}`));
            
          return (
            <Link key={item.name} href={item.href} className={`group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 ${isActive ? "bg-blue-100/80 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 font-medium shadow-[inset_0px_0px_10px_rgba(59,130,246,0.2)]" : "hover:bg-white/60 dark:hover:bg-gray-800/50 hover:translate-x-2"}`}>
              <item.icon size={18} className={`transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-sm' : 'group-hover:scale-110 group-hover:text-blue-500'}`} /> {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-white/20 dark:border-white/10 space-y-4">
        <div className="bg-white/50 dark:bg-black/50 rounded-xl p-4 shadow-sm border border-white/40 dark:border-white/10">
          <h3 className="text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200">Available Storage</h3>
          <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 mb-2 overflow-hidden">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${storagePercentage > 90 ? 'bg-red-500' : 'bg-blue-600'}`} 
              style={{ width: `${storagePercentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {formatBytes(totalSize)} of 1 GB used
          </p>
        </div>

        <div className="space-y-2">
          <Button variant="ghost" className="w-full justify-start" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {mounted && theme === "dark" ? <Sun size={18} className="mr-2" /> : <Moon size={18} className="mr-2" />} Theme
          </Button>
          <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30" onClick={() => signOut()}>
            <LogOut size={18} className="mr-2" /> Logout
          </Button>
        </div>
      </div>
    </aside>
  );
}
