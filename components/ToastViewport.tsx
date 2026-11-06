"use client";

import { useEffect } from "react";
import {
  IconHeartFilled,
  IconCircleCheck,
  IconInfoCircle,
  IconAlertCircle,
  IconX,
} from "@tabler/icons-react";
import { useToastStore } from "@/stores/useToastStore";

export default function ToastViewport() {
  const toast = useToastStore((state) => state.toast);

  const dismissToast = useToastStore((state) => state.dismissToast);

  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(() => {
      dismissToast(toast.id);
    }, 3000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [toast, dismissToast]);

  if (!toast) return null;

  const handleCloseToast = () => {
    dismissToast(toast.id);
  };

  return (
    <div className="pointer-events-none fixed inset-x-4 top-8 z-[200] flex justify-center">
      <div
        key={toast.id}
        role="status"
        aria-live="polite"
        className="custom-toast-lifecycle pointer-events-auto flex w-fit max-w-full items-center gap-3 rounded-xl border border-[#F5E8DF] bg-[#FFF9F5] px-4 py-3 text-gray-900 shadow-lg"
      >
        {toast.variant === "favorite" && (
          <IconHeartFilled size={22} className="shrink-0 text-red-500" />
        )}
        {toast.variant === "success" && (
          <IconCircleCheck size={22} className="shrink-0 text-green-600" />
        )}
        {toast.variant === "info" && (
          <IconInfoCircle size={22} className="shrink-0 text-blue-600" />
        )}
        {toast.variant === "error" && (
          <IconAlertCircle size={22} className="shrink-0 text-red-600" />
        )}
        <p className="min-w-0 text-sm font-medium break-words">
          {toast.message}
        </p>

        <button
          type="button"
          onClick={handleCloseToast}
          aria-label="알림 닫기"
          className="ml-1 shrink-0 rounded-md p-1 text-gray-500 transition-colors hover:bg-[#FBE4D4] hover:text-gray-900"
        >
          <IconX size={17} />
        </button>
      </div>
    </div>
  );
}
