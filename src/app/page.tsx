"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PawPrint } from "lucide-react";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    });
  }, [router]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-primary flex items-center justify-center mb-4 shadow-sm animate-pulse">
        <PawPrint className="w-9 h-9 stroke-[2.2]" />
      </div>
      <h1 className="text-xl font-bold text-emerald-950">CuidaPet</h1>
      <p className="text-xs text-muted-foreground mt-1">Carregando ambiente...</p>
    </div>
  );
}

