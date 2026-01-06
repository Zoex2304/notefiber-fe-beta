/**
 * HeaderGradientBackground - Theme-aware decorative gradient background.
 * 
 * This is the SINGLE SOURCE OF TRUTH for the header gradient asset.
 * Instead of using multiple SVG files for different themes, this component:
 * 
 * 1. Uses inline SVG for full CSS control
 * 2. Uses CSS variables for theme-adaptive colors
 * 3. Gradient colors (pink/purple) remain constant
 * 4. Background adapts to theme via CSS variables
 * 
 * Usage:
 * <HeaderGradientBackground className="absolute inset-0" />
 */
import { cn } from '@/lib/utils';

interface HeaderGradientBackgroundProps {
    className?: string;
}

export function HeaderGradientBackground({ className }: HeaderGradientBackgroundProps) {
    return (
        <div
            className={cn(
                "w-full h-full overflow-hidden pointer-events-none",
                className
            )}
        >
            <svg
                viewBox="0 0 1440 441"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
                preserveAspectRatio="xMidYMid slice"
            >
                <defs>
                    {/* Filters for blur effects */}
                    <filter id="hg_filter0" x="-926.522" y="-961.292" width="3218.8" height="1768.92" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                        <feFlood floodOpacity="0" result="BackgroundImageFix" />
                        <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                        <feGaussianBlur stdDeviation="76.55" result="effect1_foregroundBlur" />
                    </filter>
                    <filter id="hg_filter1" x="-1084.42" y="-1119.19" width="3534.6" height="2084.72" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                        <feFlood floodOpacity="0" result="BackgroundImageFix" />
                        <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                        <feGaussianBlur stdDeviation="155.5" result="effect1_foregroundBlur" />
                    </filter>

                    {/* Gradients - Pink and Purple with theme-adaptive end color */}
                    <linearGradient id="hg_paint0" x1="1277.61" y1="-76.6882" x2="80.6508" y2="1339.37" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#FF649A" />
                        <stop offset="1" stopColor="var(--header-gradient-fade, white)" stopOpacity="0.3" />
                    </linearGradient>
                    <linearGradient id="hg_paint1" x1="1258.81" y1="-101.324" x2="320.482" y2="1008.79" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#7050F0" />
                        <stop offset="1" stopColor="var(--header-gradient-fade, white)" stopOpacity="0.3" />
                    </linearGradient>
                    <linearGradient id="hg_paint2" x1="1277.61" y1="-76.6882" x2="80.6508" y2="1339.37" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#FF649A" stopOpacity="0.6" />
                        <stop offset="1" stopColor="var(--header-gradient-fade, white)" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="hg_paint3" x1="1258.81" y1="-101.324" x2="320.482" y2="1008.79" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#7050F0" stopOpacity="0.6" />
                        <stop offset="1" stopColor="var(--header-gradient-fade, white)" stopOpacity="0" />
                    </linearGradient>

                    {/* Clip path - NO background fill, let parent control background */}
                    <clipPath id="hg_clip0">
                        <rect width="1440" height="441" />
                    </clipPath>
                </defs>

                {/* Main gradient shapes */}
                <g clipPath="url(#hg_clip0)">
                    <g filter="url(#hg_filter0)">
                        <path d="M-773.422 617.448C412.21 -231.342 1449.94 115.193 1998.17 535.34L2139.18 654.529C2096.66 614.769 2049.57 574.731 1998.17 535.34L413.143 -804.439L-773.422 617.448Z" fill="url(#hg_paint0)" />
                        <path d="M-510.833 306.121C368.002 -427.2 1446.82 96.8497 1949.43 485.345L2095.69 608.977C2054.91 570.781 2005.79 528.916 1949.43 485.345L419.072 -808.192L-510.833 306.121Z" fill="url(#hg_paint1)" />
                    </g>
                    <g filter="url(#hg_filter1)">
                        <path d="M-773.422 617.448C412.21 -231.342 1449.94 115.193 1998.17 535.34L2139.18 654.529C2096.66 614.769 2049.57 574.731 1998.17 535.34L413.143 -804.439L-773.422 617.448Z" fill="url(#hg_paint2)" />
                        <path d="M-510.833 306.121C368.002 -427.2 1446.82 96.8497 1949.43 485.345L2095.69 608.977C2054.91 570.781 2005.79 528.916 1949.43 485.345L419.072 -808.192L-510.833 306.121Z" fill="url(#hg_paint3)" />
                    </g>
                </g>
            </svg>
        </div>
    );
}
