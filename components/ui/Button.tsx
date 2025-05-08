import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import { Slot } from "@radix-ui/react-slot";
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

// Define common props that should be excluded from DOM elements
const nonDOMProps = [
  'afterSignInUrl',
  'afterSignUpUrl',
  'afterSignOutUrl',
  'redirectUrl',
  'mode',
  'routing',
];

export const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md hover:shadow-lg hover:from-cyan-600 hover:to-blue-700 active:scale-[0.98] after:absolute after:inset-0 after:bg-gradient-to-r after:from-cyan-600 after:to-blue-700 after:opacity-0 after:transition-opacity hover:after:opacity-100 after:-z-10",
        destructive:
          "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md hover:shadow-lg hover:from-red-600 hover:to-rose-700 active:scale-[0.98] after:absolute after:inset-0 after:bg-gradient-to-r after:from-red-600 after:to-rose-700 after:opacity-0 after:transition-opacity hover:after:opacity-100 after:-z-10",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground active:scale-[0.98] hover:shadow-md hover:border-cyan-300 dark:hover:border-cyan-700",
        secondary:
          "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 hover:from-gray-200 hover:to-gray-300 shadow-sm hover:shadow-md active:scale-[0.98] dark:from-gray-800 dark:to-gray-700 dark:text-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-600",
        ghost:
          "hover:bg-accent hover:text-accent-foreground active:scale-[0.98] hover:shadow-sm",
        link: "text-primary underline-offset-4 hover:underline text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 active:scale-[0.98]",
        primary:
          "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md hover:shadow-lg hover:from-indigo-600 hover:to-purple-700 active:scale-[0.98] after:absolute after:inset-0 after:bg-gradient-to-r after:from-indigo-600 after:to-purple-700 after:opacity-0 after:transition-opacity hover:after:opacity-100 after:-z-10",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-md px-4 py-2",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  href?: string;
  target?: string;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant, size, href, target, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    // Filter out non-DOM props
    const domProps = { ...props };
    nonDOMProps.forEach(prop => {
      if (prop in domProps) {
        delete domProps[prop as keyof typeof domProps];
      }
    });

    if (href) {
      return (
        <motion.a
          href={href}
          target={target}
          className={cn(buttonVariants({ variant, size, className }))}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {children}
        </motion.a>
      );
    }
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Comp
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...domProps}
        >
          {children}
        </Comp>
      </motion.div>
    );
  }
);

Button.displayName = "Button";

export { Button };