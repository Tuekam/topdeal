import type { ButtonHTMLAttributes, ReactNode } from "react";

type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  label: string;
  children: ReactNode;
};

export function IconButton({ label, children, className, type = "button", ...props }: IconButtonProps) {
  return (
    <button {...props} aria-label={label} className={["grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-border bg-surface/95 text-text shadow-sm transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50", className].filter(Boolean).join(" ")} title={label} type={type}>
      {children}
    </button>
  );
}
