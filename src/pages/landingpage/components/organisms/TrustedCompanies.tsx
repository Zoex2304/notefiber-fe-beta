import { CompanyLogoMarquee } from "./CompanyLogoMarquee";

export function TrustedCompanies() {
    return (
        <div className="flex w-full flex-col items-center gap-[36px]">
            {/* Header Text */}
            <div className="w-full max-w-4xl px-4 lg:px-0">
                <p
                    className="
            text-customFont-dark-base 
            font-normal 
            text-center
            text-display-h5
            lg:text-display-h4
          "
                >
                    Trusted over 2k+ Company
                </p>
            </div>

            {/* Marquee Wrapper */}
            <div
                className="
          flex w-full flex-col items-center justify-center self-stretch
          px-4 py-5
          lg:px-[181.566px] lg:py-[19.629px]
        "
                style={{
                    gap: "39.258px",
                }}
            >
                <CompanyLogoMarquee />
            </div>
        </div>
    );
}
