import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type BackButtonContentProps = {
  children: ReactNode;
  className?: string;
};

type BackButtonLinkProps = BackButtonContentProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "className"> & {
    href: string;
  };

type BackButtonActionProps = BackButtonContentProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className" | "type"> & {
    href?: never;
  };

export type BackButtonProps = BackButtonLinkProps | BackButtonActionProps;

function BackArrow() {
  return (
    <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 24 24" width="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">
      <path d="m15 18-6-6 6-6M9 12h12" />
    </svg>
  );
}

export function BackButton(props: BackButtonProps) {
  const classes = ["td-button", "td-button--secondary", props.className]
    .filter(Boolean)
    .join(" ");

  if (props.href !== undefined) {
    const { children, className: _className, ...linkProps } = props;
    return (
      <a {...linkProps} className={classes}>
        <BackArrow />
        {children}
      </a>
    );
  }

  const { children, className: _className, ...buttonProps } = props;
  return (
    <button {...buttonProps} className={classes} type="button">
      <BackArrow />
      {children}
    </button>
  );
}
