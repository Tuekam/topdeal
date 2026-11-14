import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  const classes = ["td-card", className].filter(Boolean).join(" ");

  return <div {...props} className={classes} />;
}
