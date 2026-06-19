import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export const Button: React.FC<ButtonProps> = ({ children, variant = "primary", className = "", ...props }) => {
  return (
    <button
      className={`px-5 py-2.5 rounded-lg font-headings font-bold text-sm transition-all duration-200 cursor-pointer ${
        variant === "primary"
          ? "bg-brand hover:bg-brand-hover text-white shadow-md shadow-brand/10"
          : "bg-edu-blue hover:bg-edu-blue-hover text-white shadow-md shadow-edu-blue/10"
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
