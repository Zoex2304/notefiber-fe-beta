import { Toaster as Sonner } from "sonner";
import ToasterBackground from '@/assets/images/common/toaster_bg_v2.svg';
import ToasterBackgroundDark from '@/assets/images/common/toaster_bg_dark_v2.svg';

type ToasterProps = React.ComponentProps<typeof Sonner>;


/**
 * Unified Toaster Component
 * 
 * Customized Sonner toaster with:
 * - Top Center positioning
 * - Slide-down bounce animation
 * - Custom light gradient background (toaster_bg_v2.svg)
 * - Custom dark gradient background (toaster_bg_dark_v2.svg)
 * - Bold, vibrant colored icons
 */
export function Toaster({ ...props }: ToasterProps) {
    // Logic extracted to useToaster.ts - This component is now purely presentation.

    return (
        <>
            {/* Custom Styles for Animation and Theming */}
            <style>{`
        @keyframes slideDownBounce {
          0% { margin-top: -20px; scale: 0.95; opacity: 0; }
          50% { margin-top: 5px; scale: 1.02; opacity: 1; }
          75% { margin-top: -2px; scale: 0.98; }
          100% { margin-top: 0; scale: 1; }
        }
        
        [data-sonner-toaster][data-y-position="top"] [data-sonner-toast] {
          animation: slideDownBounce 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards !important;
        }

        /* Direct Background Image Handling - Simple and Robust */
        .toast-custom-bg {
            background-image: url('${ToasterBackground}') !important;
        }
        /* Dark Mode Override */
        .dark .toast-custom-bg {
            background-image: url('${ToasterBackgroundDark}') !important;
        }
      `}</style>
            <Sonner
                position="top-center"
                className="toaster group"
                toastOptions={{
                    classNames: {
                        toast: "group toast toast-custom-bg group-[.toaster]:bg-cover group-[.toaster]:bg-center group-[.toaster]:border-border group-[.toaster]:shadow-xl group-[.toaster]:rounded-xl group-[.toaster]:p-4 group-[.toaster]:gap-4 group-[.toaster]:font-sans overflow-hidden relative !bg-transparent dark:border-border/10",
                        title: "!text-foreground !font-semibold !text-sm",
                        description: "!text-muted-foreground !font-medium !text-xs",
                        actionButton: "!bg-primary !text-primary-foreground !font-semibold",
                        cancelButton: "!bg-muted !text-muted-foreground hover:!bg-muted/80",

                        // Icon coloration & Boldness
                        error: "[&_svg]:!text-red-600 dark:[&_svg]:!text-red-500 [&_svg]:!fill-transparent [&_svg]:!stroke-red-600 dark:[&_svg]:!stroke-red-500 [&_svg]:!stroke-2",
                        success: "[&_svg]:!text-green-600 dark:[&_svg]:!text-green-500 [&_svg]:!fill-transparent [&_svg]:!stroke-green-600 dark:[&_svg]:!stroke-green-500 [&_svg]:!stroke-2",
                        warning: "[&_svg]:!text-amber-600 dark:[&_svg]:!text-amber-500 [&_svg]:!fill-transparent [&_svg]:!stroke-amber-600 dark:[&_svg]:!stroke-amber-500 [&_svg]:!stroke-2",
                        info: "[&_svg]:!text-blue-600 dark:[&_svg]:!text-blue-500 [&_svg]:!fill-transparent [&_svg]:!stroke-blue-600 dark:[&_svg]:!stroke-blue-500 [&_svg]:!stroke-2",
                    },
                    style: {
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        border: '1px solid rgba(0, 0, 0, 0.05)',
                    } as React.CSSProperties
                }}
                {...props}
            />
        </>
    );
}
