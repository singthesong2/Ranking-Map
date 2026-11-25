"use client";

import { useEffect, type RefObject } from "react";

export function useOutsideClick<T extends HTMLElement>(
  elementRef: RefObject<T | null>,
  onOutsideClick: () => void,
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled) return;

    const handleClick = (event: MouseEvent) => {
      const element = elementRef.current;
      const target = event.target;
      if (!element || !(target instanceof Node)) return;
      if (!element.contains(target)) onOutsideClick();
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [elementRef, onOutsideClick, enabled]);
}
