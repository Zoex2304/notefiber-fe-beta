
import { cn } from "@/lib/utils";


export interface MeshGradientTextProps {
    /** The text content to display */
    text: string;

    /** Optional class name override */
    className?: string;

    /** 
     * Optional custom colors override.
     * Defaults to the shiny pink/white/purple set.
     * Expects an array of valid CSS color strings.
     */
    colors?: string[];

    /**
     * Optional wrapper component type (e.g., 'h1', 'h2', 'span', 'p')
     * Defaults to 'span' or takes the styling from className, 
     * but strictly renders a <span> wrapping the text for the effect.
     */
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
}

export function MeshGradientText({
    text,
    className,
    colors = ['#FF649A', '#FFFFFF', '#7050F0'],
    as: Component = 'span'
}: MeshGradientTextProps) {

    // Create the linear gradient string from the colors
    // We want a smooth transition, so we'll interleave them
    // Example: color1 0%, color2 50%, color3 100%
    // Or for the "shiny" effect, maybe more complex.
    // User requested: "composed of these three colors... soft golden shimmer".
    // A linear gradient with background-size 200% animated helps create the shimmer flow.
    // Let's toggle the sequence to ensure smooth loop if using background position.
    // #FF649A (Pink) -> #FFFFFF (White) -> #7050F0 (Purple) -> #FF649A (Pink)

    const gradientColors = colors.length === 3
        ? `${colors[0]}, ${colors[1]}, ${colors[2]}, ${colors[0]}`
        : colors.join(', ');

    return (
        <Component
            className={cn(
                "bg-clip-text text-transparent bg-[length:200%_auto] animate-shiny-text font-bold tracking-tight",
                className
            )}
            style={{
                backgroundImage: `linear-gradient(to right, ${gradientColors})`
            }}
        >
            {text}
        </Component>
    );
}
