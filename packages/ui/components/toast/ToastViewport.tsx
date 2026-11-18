"use client";

import { Toaster } from "sonner";

export function ToastViewport() {
  return (
    <Toaster
      closeButton={false}
      offset={24}
      position="top-center"
      toastOptions={{
        classNames: {
          toast: "td-sonner-toast",
          title: "td-sonner-title",
        },
        duration: 4000,
        unstyled: true,
      }}
      visibleToasts={1}
    />
  );
}
