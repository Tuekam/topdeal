"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ConfirmationDialog } from "../components/dialog/ConfirmationDialog";

export type ConfirmationRequest = {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

type PendingRequest = Required<ConfirmationRequest>;

export function useConfirmation() {
  const [request, setRequest] = useState<PendingRequest | null>(null);
  const resolveRequest = useRef<((confirmed: boolean) => void) | null>(null);

  const confirm = useCallback((nextRequest: ConfirmationRequest) => {
    if (resolveRequest.current) return Promise.resolve(false);

    return new Promise<boolean>((resolve) => {
      resolveRequest.current = resolve;
      setRequest({
        ...nextRequest,
        confirmLabel: nextRequest.confirmLabel ?? "Oui, confirmer",
        cancelLabel: nextRequest.cancelLabel ?? "Non, annuler",
      });
    });
  }, []);

  const settle = useCallback((confirmed: boolean) => {
    const resolve = resolveRequest.current;
    resolveRequest.current = null;
    setRequest(null);
    resolve?.(confirmed);
  }, []);

  useEffect(() => () => {
    resolveRequest.current?.(false);
    resolveRequest.current = null;
  }, []);

  const confirmationDialog = (
    <ConfirmationDialog
      cancelLabel={request?.cancelLabel ?? "Non, annuler"}
      confirmLabel={request?.confirmLabel ?? "Oui, confirmer"}
      description={request?.description ?? ""}
      onCancel={() => settle(false)}
      onConfirm={() => settle(true)}
      open={request !== null}
      title={request?.title ?? "Confirmer cette action"}
    />
  );

  return { confirm, confirmationDialog };
}
