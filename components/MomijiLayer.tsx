/** Decorative maple leaves — fills left zone like reference artwork */

export default function MomijiLayer() {
  return (
    <>
      <div className="momiji-layer" aria-hidden="true">
        <svg className="momiji-svg" viewBox="0 0 420 520" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="momiji-a" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c75a3f" stopOpacity="0.72" />
              <stop offset="100%" stopColor="#7d2e22" stopOpacity="0.55" />
            </linearGradient>
            <linearGradient id="momiji-b" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#e07850" stopOpacity="0.58" />
              <stop offset="100%" stopColor="#a54530" stopOpacity="0.48" />
            </linearGradient>
            <linearGradient id="momiji-c" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#b84838" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#5c2218" stopOpacity="0.38" />
            </linearGradient>
            <filter id="momiji-soft" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" />
            </filter>
          </defs>
          <g filter="url(#momiji-soft)" transform="translate(40 24) rotate(-18 120 200)">
            <path
              fill="url(#momiji-a)"
              d="M120 8 C165 52 188 118 172 178 C158 228 128 248 98 258 C68 218 28 168 38 108 C48 58 88 28 120 8 Z"
            />
            <path
              fill="url(#momiji-b)"
              opacity="0.85"
              transform="translate(-30 80) rotate(22)"
              d="M90 20 C130 48 152 102 138 152 C124 198 88 218 58 222 C38 182 12 132 28 82 C40 44 68 28 90 20 Z"
            />
            <path
              fill="url(#momiji-c)"
              opacity="0.75"
              transform="translate(60 200) rotate(-12)"
              d="M70 12 C108 38 130 88 118 138 C106 182 72 202 42 208 C22 168 -4 118 18 68 C32 32 52 20 70 12 Z"
            />
          </g>
          <g opacity="0.42" transform="translate(200 120) rotate(35)">
            <ellipse cx="0" cy="0" rx="56" ry="34" fill="#9e4a38" transform="rotate(-40)" />
            <ellipse cx="28" cy="48" rx="42" ry="26" fill="#c46348" transform="rotate(12)" />
          </g>
        </svg>
      </div>
      <style jsx>{`
        .momiji-layer {
          position: absolute;
          left: var(--rail-w);
          top: clamp(-4vh, 0%, 2vh);
          bottom: 0;
          width: min(44vmin, 36%);
          max-width: 320px;
          z-index: 3;
          pointer-events: none;
          opacity: 0.94;
        }

        .momiji-svg {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: contain;
          filter: drop-shadow(0 14px 32px rgba(80, 42, 32, 0.14));
        }

        @media (max-width: 900px) {
          .momiji-layer {
            width: min(52vmin, 55%);
            max-width: none;
            opacity: 0.55;
          }
        }
      `}</style>
    </>
  );
}
