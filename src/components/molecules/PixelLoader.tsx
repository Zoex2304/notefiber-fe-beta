import "./PixelLoader.css";

export interface PixelLoaderProps {
    /** Optional text to display alongside the loader */
    text?: string;
}

/**
 * PixelLoader - A modern, pixel-inspired loading animation
 * Inspired by Mistral's loading aesthetic
 */
export function PixelLoader({ text = "AI is thinking..." }: PixelLoaderProps) {
    return (
        <div className="flex items-center gap-3">
            <div className="pixel-loader">
                <div className="pixel-loader__block pixel-loader__block--1"></div>
                <div className="pixel-loader__block pixel-loader__block--2"></div>
                <div className="pixel-loader__block pixel-loader__block--3"></div>
                <div className="pixel-loader__block pixel-loader__block--4"></div>
                <div className="pixel-loader__block pixel-loader__block--5"></div>
            </div>
            {text && (
                <span className="text-sm text-gray-600 animate-pulse">{text}</span>
            )}
        </div>
    );
}
