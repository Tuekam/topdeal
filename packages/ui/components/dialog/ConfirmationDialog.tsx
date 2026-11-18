"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "../button/Button";

type ConfirmationDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm(): void;
  onCancel(): void;
};

export function ConfirmationDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const id = useId();

  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    const element = dialog.current;
    if (!isMounted || !element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [isMounted, open]);

  if (!isMounted) return null;

  return createPortal(
    <dialog
      aria-describedby={`${id}-description`}
      aria-labelledby={`${id}-title`}
      className="td-confirm-dialog fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-[440px] overflow-y-auto rounded-card border-0 bg-transparent p-0 backdrop:bg-overlay"
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
      ref={dialog}
    >
      <div className="rounded-card border border-border bg-surface p-5 text-text shadow-xl sm:p-6">
        <h2 className="text-lg font-semibold" id={`${id}-title`}>{title}</h2>
        <p className="mt-2 text-sm leading-6 text-text-secondary" id={`${id}-description`}>{description}</p>
        <div className="mt-6 flex flex-col-reverse justify-end gap-3 sm:flex-row">
          <Button onClick={onCancel} variant="secondary">{cancelLabel}</Button>
          <Button onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </dialog>,
    document.body,
  );
}
