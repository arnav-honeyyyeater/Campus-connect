import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn, getInitials } from "@/lib/utils";

const sizeClasses = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
  "2xl": "h-24 w-24 text-2xl",
};

export interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: keyof typeof sizeClasses;
  status?: "online" | "offline" | "busy";
}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, src, alt, name, size = "md", status, ...props }, ref) => {
  const initials = name ? getInitials(name) : alt ? getInitials(alt) : "U";

  return (
    <div className="relative inline-block shrink-0">
      <AvatarPrimitive.Root
        ref={ref}
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-full border border-campus-border bg-campus-surface-elevated select-none",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {src && (
          <AvatarPrimitive.Image
            src={src}
            alt={alt || name || "Avatar"}
            className="aspect-square h-full w-full object-cover"
          />
        )}
        <AvatarPrimitive.Fallback
          className="flex h-full w-full items-center justify-center bg-campus-surface-elevated font-semibold text-campus-dark"
        >
          {initials}
        </AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>

      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 block rounded-full ring-2 ring-white",
            size === "xs" || size === "sm" ? "h-2 w-2" : "h-3 w-3",
            status === "online" && "bg-green-500",
            status === "offline" && "bg-gray-400",
            status === "busy" && "bg-campus-coral"
          )}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
});
Avatar.displayName = "Avatar";

export { Avatar };
