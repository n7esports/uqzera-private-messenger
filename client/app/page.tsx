"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/chats");
  }, [router]);

  return <p className="p-8 text-center text-sm text-secondary">Loading...</p>;
}
