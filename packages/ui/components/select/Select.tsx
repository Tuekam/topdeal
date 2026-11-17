import { useId, type ReactNode, type SelectHTMLAttributes } from "react";

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> & {
  children: ReactNode;
  error?: string;
  hint?: string;
  label: string;
  fieldClassName?: string;
};

export function Select({
  "aria-describedby": providedDescribedBy,
  "aria-invalid": providedInvalid,
  children,
  className,
  error,
  fieldClassName,
  hint,
  id,
  label,
  ...selectProps
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? `topdeal-select-${generatedId}`;
  const hintId = `${selectId}-hint`;
  const errorId = `${selectId}-error`;
  const describedBy = [
    providedDescribedBy,
    hint ? hintId : undefined,
    error ? errorId : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={["td-input-field", fieldClassName].filter(Boolean).join(" ")}>
      <label className="td-input-label" htmlFor={selectId}>{label}</label>
      <select
        {...selectProps}
        aria-describedby={describedBy || undefined}
        aria-invalid={error ? true : providedInvalid}
        className={["td-input", "td-input--select", className].filter(Boolean).join(" ")}
        id={selectId}
      >
        {children}
      </select>
      {hint && <p className="td-input-hint" id={hintId}>{hint}</p>}
      {error && <p className="td-input-error" id={errorId} role="alert">{error}</p>}
    </div>
  );
}
