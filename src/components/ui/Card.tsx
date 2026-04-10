"use client";
import { HTMLAttributes, ReactNode, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "ghost" | "outline";
  padding?: "none" | "sm" | "md" | "lg";
  interactive?: boolean;
}

const variantClasses = {
  default: "bg-white border border-neutral-200/60 shadow-xs",
  elevated: "bg-white shadow-md border border-neutral-200/40",
  ghost: "bg-neutral-50",
  outline: "bg-transparent border border-neutral-200",
};

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant = "default", padding = "md", interactive, className = "", children, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={`
        rounded-xl transition-all duration-200
        ${variantClasses[variant]}
        ${paddingClasses[padding]}
        ${interactive ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:scale-[0.995]" : ""}
        ${className}
      `.replace(/\s+/g, " ").trim()}
      {...props}
    >
      {children}
    </div>
  );
});

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  action?: ReactNode;
}

export function CardHeader({ title, description, action, children, className = "", ...props }: CardHeaderProps) {
  return (
    <div className={`flex items-start justify-between gap-4 mb-4 ${className}`} {...props}>
      <div className="flex-1 min-w-0">
        {title && <h3 className="font-display text-lg font-semibold text-neutral-900 tracking-tight">{title}</h3>}
        {description && <p className="text-sm text-neutral-500 mt-1">{description}</p>}
        {children}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardContent({ children, className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={className} {...props}>{children}</div>;
}

export function CardFooter({ children, className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`mt-4 pt-4 border-t border-neutral-100 ${className}`} {...props}>
      {children}
    </div>
  );
}
