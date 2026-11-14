import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function Button({
  className,
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  const classes = ["td-button", `td-button--${variant}`, className]
    .filter(Boolean)
    .join(" ");

  return <button {...props} className={classes} type={type} />;
}
