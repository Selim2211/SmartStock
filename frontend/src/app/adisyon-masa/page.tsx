"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdisyonMasaPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/masalar");
  }, [router]);
  return (
    <p className="text-sm text-espresso-muted dark:text-espresso-muted">
      Yönlendiriliyor…
    </p>
  );
}
