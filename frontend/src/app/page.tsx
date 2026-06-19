"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomeRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center text-slate-500 font-body font-semibold text-xs">
      Redireccionando al panel unificado de AVENDIA...
    </div>
  );
}
