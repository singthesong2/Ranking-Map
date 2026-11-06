"use client";

import { useEffect, useState } from "react";

export function useNow() {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const updateNow = () => {
      setNow(Date.now());
    };
    updateNow();
    const timer = window.setInterval(updateNow, 30_000);
    return () => {
      window.clearInterval(timer);
    };
  }, []);

  return now;
}

export function formatRelativeTime(searchedAt: number, now: number) {
  const minutes = Math.max(0, Math.floor((now - searchedAt) / 60_000));

  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}시간 전`;

  return `${Math.floor(minutes / 1440)}일 전`;
}
