"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IconTrash } from "@tabler/icons-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  description,
  confirmText = "확인",
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  const [rendered, setRendered] = useState(false);
  const [visible, setVisible] = useState(false);

  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!isOpen) {
      setVisible(false);
      return;
    }
    setRendered(true);
    const frame = requestAnimationFrame(() => {
      setVisible(true);
    });

    return () => cancelAnimationFrame(frame);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && rendered) {
      cancelRef.current?.focus();
    }
  }, [isOpen, rendered]);

  if (!rendered) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onCancel();
        }
      }}
      onTransitionEnd={(event) => {
        if (event.target === event.currentTarget && !visible) {
          setRendered(false);
        }
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;

          if (event.shiftKey && document.activeElement === cancelRef.current) {
            event.preventDefault();
            confirmRef.current?.focus();
          } else if (
            !event.shiftKey &&
            document.activeElement === confirmRef.current
          ) {
            event.preventDefault();
            cancelRef.current?.focus();
          }
        }}
        className={`w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl transition-transform duration-200 ${
          visible ? "translate-y-0 scale-100" : "translate-y-2 scale-95"
        }`}
      >
        <div className="mb-4 flex justify-center">
          <IconTrash size={28} stroke={1.8} className="text-red-500" />
        </div>
        <h2
          id={titleId}
          className="text-center text-xl font-bold text-gray-900"
        >
          {title}
        </h2>
        <p
          id={descriptionId}
          className="mt-3 text-center text-sm leading-6 whitespace-pre-line text-gray-500"
        >
          {description}
        </p>
        <div className="mt-7 grid grid-cols-2 gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-100"
          >
            취소
          </button>

          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-red-500 px-4 py-3 font-medium text-white transition-colors hover:bg-red-600"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
