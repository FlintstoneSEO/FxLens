import type { ChangeEvent } from "react";

type FormInputFieldProps = {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "number";
  disabled?: boolean;
};

export function FormInputField({
  label,
  value,
  placeholder,
  onChange,
  type = "text",
  disabled = false
}: FormInputFieldProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
        disabled={disabled}
        className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-70"
      />
    </label>
  );
}
