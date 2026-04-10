"use client";
import { forwardRef, InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, leftIcon, rightIcon, className = "", id, ...props },
  ref
) {
  const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-neutral-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full h-11 bg-white border border-neutral-200 rounded-lg
            text-sm text-neutral-900 placeholder:text-neutral-400
            transition-all duration-150
            focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
            disabled:bg-neutral-50 disabled:text-neutral-400
            ${leftIcon ? "pl-10" : "pl-3.5"}
            ${rightIcon ? "pr-10" : "pr-3.5"}
            ${error ? "border-danger focus:border-danger focus:ring-danger/20" : ""}
            ${className}
          `.replace(/\s+/g, " ").trim()}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
            {rightIcon}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-danger mt-1.5">{error}</p>}
      {!error && hint && <p className="text-xs text-neutral-500 mt-1.5">{hint}</p>}
    </div>
  );
});
