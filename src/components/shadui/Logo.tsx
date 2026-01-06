import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import SymbolLogo from '@assets/images/landing/logo/logo_symbol.svg';
import HorizontalLogo from '@assets/images/landing/logo/logo-horizontal.svg';
import HorizontalLogoDark from '@assets/images/landing/logo/logo-horizontal-dark.svg';

// Definisikan varian size
const logoVariants = cva('flex-shrink-0', {
  variants: {
    size: {
      default: 'h-10 w-auto', // 40px
      sm: 'h-8 w-auto', // 32px
      lg: 'h-12 w-auto', // 48px
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

export interface LogoProps
  extends React.ImgHTMLAttributes<HTMLImageElement>,
  VariantProps<typeof logoVariants> {
  /**
   * Tipe logo yang akan ditampilkan
   */
  variant: 'symbol' | 'horizontal';
}

/**
 * Komponen Reusable Logo
 *
 * Menampilkan 'logo_symbol.svg' atau 'logo-horizontal.svg'
 * dengan 'size' yang bisa dikonfigurasi.
 */
export function Logo({ variant, size, className, ...props }: LogoProps) {
  if (variant === 'horizontal') {
    return (
      <div className={cn("relative", className)}>
        <img
          src={HorizontalLogo}
          alt="NoteFiber Horizontal Logo"
          className={cn(logoVariants({ size }), "dark:hidden h-full w-auto")}
          {...props}
        />
        <img
          src={HorizontalLogoDark}
          alt="NoteFiber Horizontal Logo"
          className={cn(logoVariants({ size }), "hidden dark:block h-full w-auto")}
          {...props}
        />
      </div>
    );
  }

  return (
    <img
      src={SymbolLogo}
      alt="NoteFiber Symbol"
      className={cn(logoVariants({ size, className }))}
      {...props}
    />
  );
}
