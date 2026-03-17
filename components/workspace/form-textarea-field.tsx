import type { ChangeEvent } from "react";

type FormTextareaFieldProps = {
  label: string;
  value: string;
  placeholder?: string;
  rows?: number;
  onChange: (value: string) => void;
};

export function FormTextareaField({
  label,
  value,
  placeholder,
  rows = 4,
  onChange
}: FormTextareaFieldProps) {
  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };

  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      <textarea
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
      />
    </label>
  );
}
