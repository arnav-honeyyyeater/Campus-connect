import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full font-semibold transition-colors select-none",
  {
    variants: {
      variant: {
        default:
          "bg-campus-surface-elevated text-campus-dark border border-campus-border",
        lime:
          "bg-campus-lime text-campus-dark border border-transparent shadow-xs",
        coral:
          "bg-red-50 text-campus-coral border border-red-100",
        outline:
          "bg-transparent text-campus-secondary border border-campus-border",
        success:
          "bg-green-50 text-green-700 border border-green-200",
        warning:
          "bg-amber-50 text-amber-700 border border-amber-200",
        destructive:
          "bg-red-50 text-red-700 border border-red-200",
      },
      size: {
        sm: "px-2 py-0.5 text-[11px] gap-1",
        md: "px-2.5 py-1 text-xs gap-1.5",
        lg: "px-3 py-1.5 text-sm gap-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  onRemove?: () => void;
  removeAriaLabel?: string;
}

function Badge({
  className,
  variant,
  size,
  children,
  onRemove,
  removeAriaLabel = "Remove tag",
  ...props
}: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label={removeAriaLabel}
          className="ml-0.5 -mr-1 h-3.5 w-3.5 rounded-full hover:bg-black/10 inline-flex items-center justify-center transition-colors"
        >
          <X className="h-2.5 w-2.5" />
        </button>
      )}
    </span>
  );
}

export { Badge, badgeVariants };
