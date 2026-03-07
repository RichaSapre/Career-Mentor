"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { tokenStore } from "@/lib/auth/tokenStore";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ok, setOk] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const access = tokenStore.getAccess();
    if (!access) {
      setOk(false);
      router.replace("/welcome");
    } else {
      setOk(true);
    }
  }, [router]);

  if (ok === null) return null;
  if (ok === false) return null;
  return <>{children}</>;
}
