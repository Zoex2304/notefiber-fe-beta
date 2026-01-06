import { Toaster as Sonner } from "sonner";
import ToasterBackground from '@/assets/images/common/toaster_bg_v2.svg';

type ToasterProps = React.ComponentProps<typeof Sonner>;


/**
 * Unified Toaster Component
 * 
 * Customized Sonner toaster with:
 * - Top Center positioning
 * - Slide-down bounce animation
 * - Custom light gradient background (toaster_bg_v2.svg)
 * - Dark text for readability against light bg
 * - Bold, vibrant colored icons
 */
export function Toaster({ ...props }: ToasterProps) {
    // Logic extracted to useToaster.ts - This component is now purely presentation.

    return (
        <>
            {/* Custom Keyframes for Slide Down Bounce */}
            <style>{`
        @keyframes slideDownBounce {
          0% { margin-top: -20px; scale: 0.95; opacity: 0; }
          50% { margin-top: 5px; scale: 1.02; opacity: 1; }
          75% { margin-top: -2px; scale: 0.98; }
          100% { margin-top: 0; scale: 1; }
        }
        
        /* 
           Override Sonner's animation using margin and independent scale property 
           to avoid conflicting with Sonner's internal 'transform' (used for stacking).
        */
        [data-sonner-toaster][data-y-position="top"] [data-sonner-toast] {
          animation: slideDownBounce 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards !important;
        }
      `}</style>

            <Sonner
                position="top-center"
                className="toaster group"
                toastOptions={{
                    classNames: {
                        // Container: Light gradient background, dark shadow
                        toast: "group toast group-[.toaster]:bg-cover group-[.toaster]:bg-center group-[.toaster]:border-gray-200/50 group-[.toaster]:shadow-xl group-[.toaster]:rounded-xl group-[.toaster]:p-4 group-[.toaster]:gap-4 group-[.toaster]:font-sans overflow-hidden relative !bg-transparent",

                        // Text: Dark colors for visibility on light background
                        title: "!text-gray-900 !font-semibold !text-sm",
                        description: "!text-gray-600 !font-medium !text-xs",

                        actionButton: "!bg-gray-900 !text-white !font-semibold",
                        cancelButton: "!bg-gray-100 !text-gray-500 hover:!bg-gray-200",

                        // Icon coloration & Boldness
                        // Increasing stroke width via [&_svg]:stroke-[2.5] if possible, or just color intensity
                        error: "[&_svg]:!text-red-600 [&_svg]:!fill-transparent [&_svg]:!stroke-red-600 [&_svg]:!stroke-2",
                        success: "[&_svg]:!text-green-600 [&_svg]:!fill-transparent [&_svg]:!stroke-green-600 [&_svg]:!stroke-2",
                        warning: "[&_svg]:!text-amber-600 [&_svg]:!fill-transparent [&_svg]:!stroke-amber-600 [&_svg]:!stroke-2",
                        info: "[&_svg]:!text-blue-600 [&_svg]:!fill-transparent [&_svg]:!stroke-blue-600 [&_svg]:!stroke-2",
                    },
                    style: {
                        backgroundImage: `url('${ToasterBackground}')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        // No blur needed if bg is solid enough, but kept if desired. Reduced border opacity.
                        border: '1px solid rgba(0, 0, 0, 0.05)',
                    }
                }}
                {...props}
            />
        </>
    );
}
