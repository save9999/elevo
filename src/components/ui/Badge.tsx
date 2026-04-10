import { HTMLAttributes, ReactNode } from "react";

type BadgeVariant = "default" | "primary" | "success" | "warning" | "danger" | "outline";
type BadgeSize = "sm" | "md";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-neutral-100 text-neutral-700 border border-neutral-200",
  primary: "bg-primary-50 text-primary-700 border border-primary-100",
  success: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  warning: "bg-accent-50 text-accent-700 border border-accent-100",
  danger: "bg-rose-50 text-rose-700 border border-rose-100",
  outline: "bg-transparent text-neutral-700 border border-neutral-300",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "h-5 px-2 text-2xs gap-1",
  md: "h-6 px-2.5 text-xs gap-1.5",
};

export function Badge({ variant = "default", size = "md", icon, className = "", children, ...props }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium whitespace-nowrap
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `.replace(/\s+/g, " ").trim()}
      {...props}
    >
      {icon}
      {children}
    </span>
  );
}
