import { useId, type TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: string;
  hint?: string;
  label: string;
  labelClassName?: string;
  fieldClassName?: string;
};

export function Textarea({
  "aria-describedby": providedDescribedBy,
  "aria-invalid": providedInvalid,
  className,
  error,
  fieldClassName,
  hint,
  id,
  label,
  labelClassName,
  ...textareaProps
}: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? `topdeal-textarea-${generatedId}`;
  const hintId = `${textareaId}-hint`;
  const errorId = `${textareaId}-error`;
  const describedBy = [
    providedDescribedBy,
    hint ? hintId : undefined,
    error ? errorId : undefined,
  ].filter(Boolean).join(" ");

  return (
    <div className={["td-input-field", fieldClassName].filter(Boolean).join(" ")}>
      <label className={["td-input-label", labelClassName].filter(Boolean).join(" ")} htmlFor={textareaId}>
        {label}
      </label>
      <textarea
        {...textareaProps}
        aria-describedby={describedBy || undefined}
        aria-invalid={error ? true : providedInvalid}
        className={["td-textarea", className].filter(Boolean).join(" ")}
        id={textareaId}
      />
      {hint && <p className="td-input-hint" id={hintId}>{hint}</p>}
      {error && <p className="td-input-error" id={errorId} role="alert">{error}</p>}
    </div>
  );
}
