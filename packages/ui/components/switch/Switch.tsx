import { useId, type InputHTMLAttributes } from "react";

type SwitchProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "checked" | "onChange" | "size" | "type"
> & {
  checked: boolean;
  description?: string;
  label: string;
  onCheckedChange(checked: boolean): void;
};

export function Switch({
  checked,
  description,
  id,
  label,
  onCheckedChange,
  ...inputProps
}: SwitchProps) {
  const generatedId = useId();
  const inputId = id ?? `topdeal-switch-${generatedId}`;
  const descriptionId = `${inputId}-description`;

  return (
    <div className="td-switch-row">
      <div className="td-switch-copy">
        <label className="td-switch-label" htmlFor={inputId}>{label}</label>
        {description && (
          <p className="td-switch-description" id={descriptionId}>{description}</p>
        )}
      </div>
      <label className="td-switch-control" htmlFor={inputId}>
        <input
          {...inputProps}
          aria-checked={checked}
          aria-describedby={description ? descriptionId : undefined}
          checked={checked}
          className="td-switch-input"
          id={inputId}
          onChange={(event) => onCheckedChange(event.target.checked)}
          role="switch"
          type="checkbox"
        />
        <span aria-hidden="true" className="td-switch-track" />
      </label>
    </div>
  );
}
