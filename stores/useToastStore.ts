import { create } from "zustand";

type ToastVariant = "favorite" | "success" | "info" | "error";

interface ToastMessage {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastStore {
  toast: ToastMessage | null;
  nextId: number;
  showToast: (message: string, variant?: ToastVariant) => void;
  dismissToast: (id?: number) => void;
}

export const useToastStore = create<ToastStore>()((set) => ({
  toast: null,
  nextId: 0,

  showToast: (message, variant = "success") =>
    set((state) => {
      const id = state.nextId + 1;

      return {
        nextId: id,
        toast: {
          id,
          message,
          variant,
        },
      };
    }),

  dismissToast: (id) =>
    set((state) => {
      if (!state.toast) return state;
      if (id !== undefined && state.toast.id !== id) return state;

      return {
        toast: null,
      };
    }),
}));
