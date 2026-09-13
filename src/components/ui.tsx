import { cn } from "@/lib/utils";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import {
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";

export function Button({
  className,
  variant = "solid",
  size = "md",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "solid" | "primary" | "ghost" | "outline" | "soft";
  size?: "sm" | "md" | "lg" | "icon";
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium select-none",
        "transition-[transform,box-shadow,background-color] duration-150 ease-out",
        "active:not-disabled:scale-[0.96] disabled:pointer-events-none disabled:opacity-40",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        variant === "solid" && "bg-fg text-bg hover:opacity-90",
        variant === "primary" && "bg-primary text-primary-fg hover:opacity-90",
        variant === "ghost" && "bg-transparent text-fg hover:bg-sunken",
        variant === "outline" && "bg-surface text-fg shadow-card hover:bg-sunken",
        variant === "soft" && "bg-sunken text-fg hover:opacity-90",
        size === "sm" && "h-9 rounded-lg px-3 text-sm",
        size === "md" && "h-11 rounded-xl px-4 text-sm",
        size === "lg" && "h-12 rounded-2xl px-5 text-base",
        size === "icon" && "size-11 rounded-full",
        className,
      )}
      {...props}
    />
  );
}

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-xl bg-surface px-3 text-base text-fg shadow-card",
        "placeholder:text-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-2xl bg-surface px-3 py-3 text-base text-fg shadow-card",
        "placeholder:text-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70",
        className,
      )}
      {...props}
    />
  );
}

export function Switch({
  checked,
  onCheckedChange,
  disabled,
}: {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <SwitchPrimitive.Root
      checked={checked}
      disabled={disabled}
      onCheckedChange={onCheckedChange}
      className={cn(
        "relative h-7 w-12 shrink-0 rounded-full transition-colors",
        checked ? "bg-primary" : "bg-border",
        disabled && "opacity-40",
      )}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "block size-5 translate-x-1 rounded-full bg-bg shadow-sm transition-transform",
          "data-[state=checked]:translate-x-6",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("rounded-2xl bg-surface p-4 shadow-card", className)}>
      {children}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button aria-label="Close" className="absolute inset-0 bg-fg/40" onClick={onClose} />
      <div className="relative max-h-[88dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-bg p-5 shadow-card sm:rounded-3xl">
        {title ? (
          <h2 className="mb-4 font-display text-lg font-semibold tracking-tight">{title}</h2>
        ) : null}
        {children}
      </div>
    </div>
  );
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="flex rounded-full bg-sunken p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "h-9 min-h-11 flex-1 rounded-full px-2 text-sm font-medium transition-colors",
            value === o.value ? "bg-surface text-fg shadow-card" : "text-muted",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Page({
  title,
  kicker,
  children,
  action,
}: {
  title: string;
  kicker?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="px-4 pb-28 pt-6">
      {kicker ? (
        <p className="mb-1 text-xs font-medium uppercase tracking-[0.16em] text-muted">
          {kicker}
        </p>
      ) : null}
      <div className="mb-5 flex items-start justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold tracking-tight">{title}</h1>
        {action}
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

export function Range({
  value,
  min = 1,
  max = 10,
  onChange,
  color,
}: {
  value: number;
  min?: number;
  max?: number;
  onChange: (n: number) => void;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-sunken accent-current"
        style={{ color: color || "var(--color-primary)" }}
      />
      <span className="w-6 text-right font-display text-lg tabular-nums">{value}</span>
    </div>
  );
}
