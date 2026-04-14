"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Settings, Wifi, WifiOff } from "lucide-react";

export function TopBar() {
  const [kernelOnline, setKernelOnline] = useState<boolean | null>(null);

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch("http://localhost:8000/api/health");
        setKernelOnline(res.ok);
      } catch {
        setKernelOnline(false);
      }
    }
    check();
    const interval = setInterval(check, 10_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-14 border-b border-gray-800 flex items-center justify-between px-6 bg-gray-950 shrink-0">
      <div />

      <div className="flex items-center gap-4">
        {/* Kernel status indicator */}
        <div className="flex items-center gap-2 text-xs">
          {kernelOnline === null ? (
            <span className="text-gray-600">Checking...</span>
          ) : kernelOnline ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-green-400" />
              <span className="text-green-400">Kernel Online</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-red-400" />
              <span className="text-red-400">Kernel Offline</span>
            </>
          )}
        </div>

        <Link
          href="/settings"
          className="p-2 text-gray-500 hover:text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Settings className="w-4 h-4" />
        </Link>
      </div>
    </header>
  );
}
