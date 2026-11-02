import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center font-medium transition-all duration-150 select-none disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-campus-dark focus-visible:ring-offset-2 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-campus-lime text-campus-dark font-semibold hover:bg-[#CEE85E] shadow-sm border border-transparent",
        secondary:
          "bg-white text-campus-dark border border-campus-border hover:bg-campus-surface-elevated hover:border-[#D0D3C7]",
        outline:
          "bg-transparent text-campus-dark border border-campus-border hover:bg-campus-surface-elevated",
        ghost:
          "bg-transparent text-campus-dark hover:bg-campus-dark/5 active:bg-campus-dark/10",
        destructive:
          "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:border-red-300",
        link:
          "text-campus-dark underline-offset-4 hover:underline p-0 h-auto active:scale-100",
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
        md: "h-10 px-4 text-sm rounded-xl gap-2",
        lg: "h-12 px-6 text-base rounded-xl gap-2.5",
        icon: "h-10 w-10 p-0 rounded-xl justify-center",
        "icon-sm": "h-8 w-8 p-0 rounded-lg justify-center",
        pill: "h-9 px-4 rounded-full text-xs font-semibold gap-1.5",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin shrink-0" />
            <span>{loadingText || children}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
