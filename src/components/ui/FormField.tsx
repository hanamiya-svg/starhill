import { ChevronDown } from "lucide-react";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

type BaseProps = {
  id: string;
  label: string;
  required?: boolean;
  requiredLabel?: string;
  error?: string;
  hint?: ReactNode;
};

const control =
  "peer block w-full appearance-none rounded-none border-0 border-b border-line-strong bg-transparent px-0 pt-2 pb-3 text-base text-ink placeholder:text-ink-muted/60 transition-colors duration-300 focus:border-ink focus:outline-none focus-visible:outline-none aria-[invalid=true]:border-[#8a3b2e]";

function Shell({ id, label, required, requiredLabel, error, children }: BaseProps & { children: ReactNode }) {
  return (
    <div className="group relative">
      <label htmlFor={id} className="label-caps block text-ink-muted transition-colors group-focus-within:text-ink">
        {label}
        {required ? (
          <>
            <span aria-hidden className="ml-1 text-ink">
              *
            </span>
            {requiredLabel ? <span className="sr-only"> ({requiredLabel})</span> : null}
          </>
        ) : null}
      </label>
      {children}
      {/* Focus line that draws across under the field. */}
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-ink transition-transform duration-500 ease-[var(--ease-out)] group-focus-within:scale-x-100"
      />
      <p id={`${id}-error`} className="min-h-5 pt-2 text-xs text-[#8a3b2e]" aria-live="polite">
        {error ?? ""}
      </p>
    </div>
  );
}

export function TextField({
  id,
  label,
  required,
  requiredLabel,
  error,
  ...input
}: BaseProps & Omit<InputHTMLAttributes<HTMLInputElement>, "id">) {
  return (
    <Shell id={id} label={label} required={required} requiredLabel={requiredLabel} error={error}>
      <input
        id={id}
        name={id}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={control}
        {...input}
      />
    </Shell>
  );
}

export function TextAreaField({
  id,
  label,
  error,
  ...textarea
}: BaseProps & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id">) {
  return (
    <Shell id={id} label={label} error={error}>
      <textarea
        id={id}
        name={id}
        rows={3}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${control} min-h-24 resize-y`}
        {...textarea}
      />
    </Shell>
  );
}

export function SelectField({
  id,
  label,
  options,
  error,
  ...select
}: BaseProps & { options: { value: string; label: string }[] } & Omit<SelectHTMLAttributes<HTMLSelectElement>, "id">) {
  return (
    <Shell id={id} label={label} error={error}>
      <div className="relative">
        <select
          id={id}
          name={id}
          aria-invalid={error ? true : undefined}
          className={`${control} cursor-pointer pr-8`}
          {...select}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown aria-hidden className="pointer-events-none absolute top-1/2 right-0 size-4 -translate-y-1/2 text-ink-muted" strokeWidth={1.25} />
      </div>
    </Shell>
  );
}
