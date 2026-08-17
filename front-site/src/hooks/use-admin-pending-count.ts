"use client";

import { useEffect, useState } from "react";

export function useAdminPendingCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetch("/api/registrations")
      .then((r) => r.json())
      .then((data: { status: string }[]) => {
        setCount(data.filter((s) => s.status === "pendente").length);
      })
      .catch(() => {});
  }, []);

  return count;
}
