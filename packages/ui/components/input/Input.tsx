import { useId, type InputHTMLAttributes } from "react";

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  error?: string;
  hint?: string;
  label: string;
  fieldClassName?: string;
};

export function Input({
  "aria-describedby": providedDescribedBy,
  "aria-invalid": providedInvalid,
  className,
  error,
  fieldClassName,
  hint,
  id,
  label,
  ...inputProps
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? `topdeal-input-${generatedId}`;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const describedBy = [
    providedDescribedBy,
    hint ? hintId : undefined,
    error ? errorId : undefined,
  ]
    .filter(Boolean)
    .join(" ");
  const inputClassName = ["td-input", className].filter(Boolean).join(" ");

  return (
    <div className={["td-input-field", fieldClassName].filter(Boolean).join(" ")}>
      <label className="td-input-label" htmlFor={inputId}>
        {label}
      </label>
      <input
        {...inputProps}
        aria-describedby={describedBy || undefined}
        aria-invalid={error ? true : providedInvalid}
        className={inputClassName}
        id={inputId}
      />
      {hint && (
        <p className="td-input-hint" id={hintId}>
          {hint}
        </p>
      )}
      {error && (
        <p className="td-input-error" id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
