import { memo } from "react";

export const WaveBackground = memo(() => {
  return (
    <div className="absolute top-0 left-0 w-full h-[250px] pointer-events-none z-0 overflow-hidden">
      <svg
        viewBox="0 0 1440 250"
        preserveAspectRatio="none"
        className="w-full h-full drop-shadow-md"
      >
        <defs>
          <linearGradient id="primaryWave" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.85" />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.5" />
          </linearGradient>
        </defs>

        {/* Base Solid Fill matching the project's accent tone */}
        <path
          fill="url(#primaryWave)"
          d="M0,0 L1440,0 L1440,140 C1100,260 340,60 0,220 Z"
        />

        {/* Subtle topographic / flow lines imitating the premium design vibe */}
        <path
          fill="none"
          stroke="rgba(255, 255, 255, 0.12)"
          strokeWidth="1.5"
          d="M0,40 C340,180 1100,0 1440,100"
        />
        <path
          fill="none"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth="2"
          d="M0,80 C340,220 1100,40 1440,140"
        />
        <path
          fill="none"
          stroke="rgba(255, 255, 255, 0.15)"
          strokeWidth="1"
          d="M0,20 C340,120 1100,60 1440,80"
        />
        <path
          fill="none"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth="3"
          d="M0,120 C340,280 1100,80 1440,200"
        />
        <path
          fill="none"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="1"
          d="M-100,160 C240,320 1000,100 1340,240"
        />
      </svg>
    </div>
  );
});
