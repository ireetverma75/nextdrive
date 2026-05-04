import Sidebar from "@/components/layout/Sidebar";
import FileGrid from "@/components/files/FileGrid";
import UploadModal from "@/components/files/UploadModal";
import { Suspense } from "react";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const params = await searchParams;
  const tab = params.tab || "home";

  return (
    <div className="flex min-h-screen">
      <Suspense fallback={<div className="w-64 border-r border-white/20 dark:border-white/10 h-screen flex flex-col p-4" />}>
        <Sidebar />
      </Suspense>
      <main className="flex-1 max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/20 dark:border-white/10 bg-white/40 dark:bg-black/30 backdrop-blur-2xl sticky top-0 z-10">
          <h2 className="text-xl font-semibold">My Files</h2>
          <UploadModal />
        </div>
        <Suspense fallback={<div className="p-6">Loading files...</div>}>
          <FileGrid tab={tab} />
        </Suspense>
      </main>
    </div>
  );
}
