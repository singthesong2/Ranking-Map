"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function useCountdownRedirect(initialSeconds: number, destination: string) {
  const router = useRouter();
  const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (remainingSeconds <= 0) {
      router.replace(destination);
      return;
    }

    const timer = window.setTimeout(() => {
      setRemainingSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [remainingSeconds, destination, router]);

  return remainingSeconds;
}

export default useCountdownRedirect;
