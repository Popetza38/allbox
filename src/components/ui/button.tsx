/**
 * Button Component with Explicit Variant Exports
 *
 * Provides both flexible variant props and explicit variant components
 * for better developer experience and discoverability.
 *
 * @example
 * // Using variant prop (flexible)
 * <Button variant="destructive">Delete</Button>
 *
 * @example
 * // Using explicit variant (discoverable)
 * <Button.Destructive>Delete</Button.Destructive>
 */

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

interface ButtonComponent extends React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>> {
  Primary: React.ForwardRefExoticComponent<Omit<ButtonProps, "variant"> & React.RefAttributes<HTMLButtonElement>>;
  Destructive: React.ForwardRefExoticComponent<Omit<ButtonProps, "variant"> & React.RefAttributes<HTMLButtonElement>>;
  Outline: React.ForwardRefExoticComponent<Omit<ButtonProps, "variant"> & React.RefAttributes<HTMLButtonElement>>;
  Secondary: React.ForwardRefExoticComponent<Omit<ButtonProps, "variant"> & React.RefAttributes<HTMLButtonElement>>;
  Ghost: React.ForwardRefExoticComponent<Omit<ButtonProps, "variant"> & React.RefAttributes<HTMLButtonElement>>;
  Link: React.ForwardRefExoticComponent<Omit<ButtonProps, "variant"> & React.RefAttributes<HTMLButtonElement>>;
  Small: React.ForwardRefExoticComponent<Omit<ButtonProps, "size"> & React.RefAttributes<HTMLButtonElement>>;
  Large: React.ForwardRefExoticComponent<Omit<ButtonProps, "size"> & React.RefAttributes<HTMLButtonElement>>;
  Icon: React.ForwardRefExoticComponent<Omit<ButtonProps, "size"> & React.RefAttributes<HTMLButtonElement>>;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
) as ButtonComponent;
Button.displayName = "Button";

export { Button, buttonVariants };

/**
 * Explicit Variant Components
 *
 * Pre-configured Button components for each variant.
 * These provide better discoverability and type safety.
 *
 * @example
 * <Button.Primary>Click me</Button.Primary>
 * <Button.Destructive>Delete</Button.Destructive>
 */

interface VariantButtonProps extends Omit<ButtonProps, "variant"> {}

const createVariantButton = (variant: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link") => {
  const VariantButton = React.forwardRef<HTMLButtonElement, VariantButtonProps>(
    ({ className, size, asChild = false, ...props }, ref) => {
      return (
        <Button
          ref={ref}
          variant={variant}
          size={size}
          asChild={asChild}
          className={className}
          {...props}
        />
      );
    }
  );
  VariantButton.displayName = `Button.${variant.charAt(0).toUpperCase() + variant.slice(1)}`;
  return VariantButton;
};

// Attach variant components to Button
Button.Primary = createVariantButton("default");
Button.Destructive = createVariantButton("destructive");
Button.Outline = createVariantButton("outline");
Button.Secondary = createVariantButton("secondary");
Button.Ghost = createVariantButton("ghost");
Button.Link = createVariantButton("link");

// Size variants
interface SizeButtonProps extends Omit<ButtonProps, "size"> {}

const createSizeButton = (size: "sm" | "default" | "lg" | "icon") => {
  const SizeButton = React.forwardRef<HTMLButtonElement, SizeButtonProps>(
    ({ className, variant, asChild = false, ...props }, ref) => {
      return (
        <Button
          ref={ref}
          variant={variant}
          size={size}
          asChild={asChild}
          className={className}
          {...props}
        />
      );
    }
  );
  SizeButton.displayName = `Button.${size.charAt(0).toUpperCase() + size.slice(1)}`;
  return SizeButton;
};

Button.Small = createSizeButton("sm");
Button.Large = createSizeButton("lg");
Button.Icon = createSizeButton("icon");
