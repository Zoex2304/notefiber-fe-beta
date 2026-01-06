import { Rocket, Sparkles } from 'lucide-react';
import './SocialProofToast.css';

interface SocialProofToastProps {
    title: string;
    message: string;
    avatarUrl?: string;
    planName?: string;
    onUpgradeClick: () => void;
    onDismiss: () => void;
}

export function SocialProofToast({
    title,
    message,
    avatarUrl,
    planName,
    onUpgradeClick,
    onDismiss,
}: SocialProofToastProps) {
    return (
        <div className="social-proof-toast relative flex w-full max-w-md flex-col rounded-xl p-4 text-white shadow-2xl">
            {/* Header / Content */}
            <div className="flex items-start gap-4 z-10">
                {avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt="User"
                        className="h-12 w-12 rounded-full border-2 border-white/20 object-cover shadow-sm"
                    />
                ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                        <Sparkles className="h-6 w-6 text-yellow-300" />
                    </div>
                )}

                <div className="flex-1">
                    <h4 className="text-base font-bold leading-tight flex items-center gap-2">
                        {title}
                        <span className="inline-flex h-2 w-2 animate-ping rounded-full bg-green-400 opacity-75"></span>
                    </h4>
                    <p className="mt-1 text-sm text-white/90 leading-snug">
                        {message}
                    </p>
                    {planName && (
                        <p className="mt-1 text-xs font-medium text-yellow-300/90 uppercase tracking-wider">
                            Just joined {planName}
                        </p>
                    )}
                </div>

                <button
                    onClick={onDismiss}
                    className="ml-auto text-white/50 hover:text-white transition-colors"
                >
                    <span className="sr-only">Dismiss</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                        />
                    </svg>
                </button>
            </div>

            {/* CTA Button */}
            <button
                onClick={onUpgradeClick}
                className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-indigo-600 shadow-lg transition-all hover:bg-white/95 hover:scale-[1.02] hover:shadow-xl active:scale-95 z-10"
            >
                <Rocket className="h-4 w-4" />
                Upgrade Now to Unlock
            </button>
        </div>
    );
}
