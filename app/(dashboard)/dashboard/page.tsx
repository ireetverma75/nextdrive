import Sidebar from "@/components/layout/Sidebar";
import FileGrid from "@/components/files/FileGrid";
import UploadModal from "@/components/files/UploadModal";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
          <h2 className="text-xl font-semibold">My Files</h2>
          <UploadModal />
        </div>
        <FileGrid />
      </main>
    </div>
  );
}
