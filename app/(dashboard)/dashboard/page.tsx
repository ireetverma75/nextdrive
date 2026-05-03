import Sidebar from "@/components/layout/Sidebar";
import FileGrid from "@/components/files/FileGrid";
import UploadModal from "@/components/files/UploadModal";
import StorageBot from "@/components/layout/StorageBot";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const params = await searchParams;
  const tab = params.tab || "home";

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/20 dark:border-white/10 bg-white/40 dark:bg-black/30 backdrop-blur-2xl sticky top-0 z-10">
          <h2 className="text-xl font-semibold">My Files</h2>
          <UploadModal />
        </div>
        <FileGrid tab={tab} />
      </main>
      <StorageBot />
    </div>
  );
}
