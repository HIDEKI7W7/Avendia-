"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function DocumentosRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/historial");
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
      <Loader2 className="w-8 h-8 text-[#7C6CF2] animate-spin" />
      <span className="text-xs font-semibold text-slate-500">
        Redireccionando al historial...
      </span>
    </div>
  );
}
