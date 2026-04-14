import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HardDrive } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center flex-col items-center gap-4">
          <div className="p-4 bg-blue-100 dark:bg-blue-900/40 rounded-full">
             <HardDrive size={48} className="text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold">NextDrive</h1>
          <p className="text-lg text-gray-500">Your Files, Next Level. A modern, serverless cloud storage platform.</p>
        </div>
        
        <div className="flex flex-col gap-4 mt-8">
          <Link href="/login" className="w-full">
            <Button className="w-full text-lg py-6 bg-blue-600 hover:bg-blue-700 text-white">Get Started</Button>
          </Link>
          <Link href="/dashboard" className="w-full">
            <Button variant="outline" className="w-full text-lg py-6">Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
