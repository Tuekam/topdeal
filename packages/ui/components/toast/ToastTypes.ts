export type ToastKind = "success" | "error" | "info";

export type ToastInput = {
  kind: ToastKind;
  title: string;
  description?: string;
};
