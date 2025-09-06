// components/ui/Button.tsx
import clsx from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  fullWidth?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "rounded transition font-semibold tracking-wide",
        {
          // Variants
          "bg-black text-white hover:bg-gray-800": variant === "primary",
          "border border-black text-black hover:bg-black hover:text-white":
            variant === "outline",
          "bg-transparent text-black hover:underline": variant === "ghost",
          "bg-red-600 text-white hover:bg-red-700": variant === "danger",

          // Sizes
          "px-4 py-2 text-sm": size === "sm",
          "px-6 py-3 text-base": size === "md",
          "px-8 py-4 text-lg": size === "lg",
          "p-2": size === "icon",

          // Full width
          "w-full": fullWidth,
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
