import { type ReactNode, type ButtonHTMLAttributes, type InputHTMLAttributes } from "react";

export function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(" ");
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

export function Button({ variant = "primary", size = "md", className, children, ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
  const variants = {
    primary: "bg-primary text-primary-foreground hover:brightness-110 shadow-sm",
    secondary: "bg-secondary text-secondary-foreground hover:bg-muted border border-border",
    ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
    outline: "border border-border bg-transparent hover:bg-muted text-foreground",
    danger: "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100",
  };
  const sizes = {
    sm: "h-8 px-3 text-sm rounded-md",
    md: "h-10 px-4 text-sm rounded-lg",
    lg: "h-12 px-6 text-base rounded-xl",
  };
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "purple" | "outline";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const base = "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium";
  const variants = {
    default: "bg-muted text-muted-foreground",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
    danger: "bg-red-50 text-red-600 border border-red-200",
    info: "bg-sky-50 text-sky-700 border border-sky-200",
    purple: "bg-violet-50 text-violet-700 border border-violet-200",
    outline: "border border-border text-muted-foreground bg-transparent",
  };
  return <span className={cn(base, variants[variant], className)}>{children}</span>;
}

interface AvatarProps {
  src?: string;
  name: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const sizes = { xs: "h-6 w-6 text-xs", sm: "h-8 w-8 text-sm", md: "h-10 w-10 text-sm", lg: "h-12 w-12 text-base", xl: "h-16 w-16 text-xl" };
  const initials = name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
  const colors = ["bg-rose-100 text-rose-700", "bg-violet-100 text-violet-700", "bg-amber-100 text-amber-700", "bg-teal-100 text-teal-700", "bg-sky-100 text-sky-700"];
  const color = colors[name.charCodeAt(0) % colors.length];
  if (src) {
    return <img src={src} alt={name} className={cn("rounded-full object-cover", sizes[size], className)} />;
  }
  return (
    <div className={cn("rounded-full flex items-center justify-center font-semibold shrink-0", sizes[size], color, className)}>
      {initials}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-foreground">{label}</label>}
      <input
        className={cn(
          "h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none transition-all",
          "placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15",
          error && "border-red-300 focus:border-red-400 focus:ring-red-100",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, hover, onClick }: CardProps) {
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-xl",
        hover && "cursor-pointer hover:border-primary/40 hover:shadow-md transition-all duration-200",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function Stars({ rating, count }: { rating: number; count?: number }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="text-amber-400">{"★".repeat(Math.round(rating))}</span>
      <span className="text-sm font-medium text-foreground">{rating.toFixed(1)}</span>
      {count && <span className="text-xs text-muted-foreground">({count})</span>}
    </span>
  );
}

export function Divider({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-border", className)} />;
}

export function Select({ label, options, value, onChange, className }: {
  label?: string;
  options: { label: string; value: string }[];
  value?: string;
  onChange?: (v: string) => void;
  className?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-foreground">{label}</label>}
      <select
        value={value}
        onChange={e => onChange?.(e.target.value)}
        className={cn(
          "h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none transition-all cursor-pointer",
          "focus:border-primary focus:ring-2 focus:ring-primary/15 appearance-none",
          className
        )}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
