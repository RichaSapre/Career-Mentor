"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/welcome");
  }, [router]);
  return (
    <main className="bg-gradient-soft min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-muted">Loading...</div>
    </main>
  );
}
