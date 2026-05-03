"use client";
import Link from "next/link";
import { HardDrive, Share2, Trash2, LayoutGrid, LogOut, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";

const navItems = [
  { name: "Home", icon: LayoutGrid, href: "/dashboard" },
  { name: "Shared", icon: Share2, href: "/dashboard?tab=shared" },
  { name: "Trash", icon: Trash2, href: "/dashboard?tab=trash" },
];

export default function Sidebar() {
  const { setTheme, theme } = useTheme();
  // Avoid hydration mismatch by waiting for mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <aside className="w-64 border-r border-white/20 dark:border-white/10 h-screen flex flex-col p-4 bg-white/40 dark:bg-black/30 backdrop-blur-2xl shadow-2xl z-20 relative">
      <h1 className="text-xl font-bold mb-6 flex items-center gap-2">
        <HardDrive className="text-blue-600" /> NextDrive
      </h1>
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <Link key={item.name} href={item.href} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <item.icon size={18} /> {item.name}
          </Link>
        ))}
      </nav>
      <div className="space-y-2">
        <Button variant="ghost" className="w-full justify-start" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {mounted && theme === "dark" ? <Sun size={18} /> : <Moon size={18} />} Theme
        </Button>
        <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600" onClick={() => signOut()}>
          <LogOut size={18} /> Logout
        </Button>
      </div>
    </aside>
  );
}
