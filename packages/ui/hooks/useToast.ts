"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import type { ToastInput } from "../components/toast/ToastTypes";

export function useToast() {
  return useCallback((message: ToastInput) => {
    const content = message.description
      ? `${message.title} · ${message.description}`
      : message.title;

    if (message.kind === "success") toast.success(content);
    else if (message.kind === "error") toast.error(content);
    else toast.info(content);
  }, []);
}
