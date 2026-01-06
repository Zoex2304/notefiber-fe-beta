import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Mendefinisikan semua varian style untuk Button.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center font-semibold transition-all duration-200 hover:opacity-90 active:scale-95 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Varian default dengan gradient
        default:
          "bg-gradient-secondary text-white border-[0.368px] border-[#957FEE] shadow-[inset_0_0_2.331px_0_#FFF]",

        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",

        // Outline - border dan text keduanya muted agar selaras
        outline:
          "border border-input bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground",

        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",

        ghost: "hover:bg-accent hover:text-accent-foreground",

        link: "text-primary underline-offset-4 hover:underline",

        // Custom outline dengan border primary
        "custom-outline":
          "border border-customBorder-primary bg-transparent text-customFont-dark-base hover:bg-gray-100",

        // Glass/Glassmorphism effect
        glass:
          "bg-white/30 backdrop-blur-sm border border-white/20 text-customFont-dark-base hover:bg-white/50 rounded-full",
      },
      size: {
        // Size default
        default:
          "px-[22.082px] py-[9.814px] rounded-[61.34px] gap-[12.268px] text-[14px] leading-[19.6px]",

        sm: "h-9 rounded-md px-3 text-sm",

        lg: "h-11 rounded-md px-8 text-base",

        icon: "h-10 w-10",

        "custom-sm": "px-4 py-2 rounded-full text-[13px] leading-[18.2px]",

        "custom-lg": "px-8 py-4 rounded-full text-[20px] leading-[28px]",

        // Size untuk toggle pricing
        toggle:
          "px-[23.904px] py-[12.871px] rounded-[7px] gap-[9.194px] text-[14px] leading-[19.6px]",

        // Size untuk tombol di dalam pricing card
        "card-outline":
          "px-[21.943px] py-[8.777px] rounded-[81.189px] gap-[21.943px] text-[14px] leading-[19.6px] w-full",

        // Size untuk subscribe button
        subscribe:
          "px-[22.075px] py-[9.811px] rounded-full gap-[12.264px] text-[14px] leading-[19.6px]",
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
  VariantProps<typeof buttonVariants> { }

/**
 * Komponen Button yang reusable.
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants };