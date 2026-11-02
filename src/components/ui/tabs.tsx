import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    variant?: "pill" | "underline";
  }
>(({ className, variant = "pill", ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex items-center text-campus-secondary",
      variant === "pill" &&
        "p-1 bg-campus-surface-elevated rounded-full border border-campus-border gap-1",
      variant === "underline" &&
        "w-full border-b border-campus-border gap-6 bg-transparent",
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    variant?: "pill" | "underline";
  }
>(({ className, variant = "pill", ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap text-xs sm:text-sm font-medium transition-all select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-campus-dark disabled:pointer-events-none disabled:opacity-50",
      variant === "pill" &&
        "px-3.5 py-1.5 rounded-full data-[state=active]:bg-campus-lime data-[state=active]:text-campus-dark data-[state=active]:font-semibold data-[state=active]:shadow-xs hover:text-campus-dark",
      variant === "underline" &&
        "py-3 border-b-2 border-transparent data-[state=active]:border-campus-dark data-[state=active]:text-campus-dark data-[state=active]:font-semibold -mb-px hover:text-campus-dark",
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-campus-dark rounded-xl",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
