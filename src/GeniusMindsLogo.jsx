// Genius Minds Logo SVG - Embed in Header.jsx
// Usage: <GeniusMindsLogo width={120} height={40} />

export function GeniusMindsLogo({ width = 160, height = 48 }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 400 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="logo-svg"
    >
      {/* Navy Blue Background */}
      <rect width="400" height="120" rx="8" fill="#1E3A8A" />
      
      {/* Diamond Icon - White with internal cross */}
      <g transform="translate(40, 28)">
        {/* Outer Diamond */}
        <polygon
          points="0,24 24,0 48,24 24,48"
          fill="#FFFFFF"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Inner Cross */}
        <rect x="20" y="10" width="8" height="36" fill="#1E3A8A" rx="2" />
        <rect x="10" y="20" width="36" height="8" fill="#1E3A8A" rx="2" />
        {/* Inner Diamond Glow */}
        <polygon
          points="2,26 22,-2 46,26 22,50"
          fill="url(#diamond-glow)"
          opacity="0.3"
        />
      </g>

      {/* GENIUS Text */}
      <text
        x="110"
        y="32"
        fontFamily="Inter, -apple-system, sans-serif"
        fontSize="22"
        fontWeight="800"
        fill="#FFFFFF"
        letterSpacing="-0.02em"
      >
        GENIUS
      </text>

      {/* MINDS Text */}
      <text
        x="110"
        y="52"
        fontFamily="Inter, -apple-system, sans-serif"
        fontSize="20"
        fontWeight="700"
        fill="#FFFFFF"
        letterSpacing="0.05em"
      >
        MINDS
      </text>

      {/* Horizontal Lines */}
      <line x1="105" y1="45" x2="250" y2="45" stroke="#60A5FA" strokeWidth="2" />
      <line x1="105" y1="50" x2="250" y2="50" stroke="#60A5FA" strokeWidth="2" />

      {/* MAKING CODE Text */}
      <text
        x="260"
        y="32"
        fontFamily="Inter, -apple-system, sans-serif"
        fontSize="18"
        fontWeight="700"
        fill="#93C5FD"
        letterSpacing="-0.01em"
      >
        MAKING
      </text>
      <text
        x="260"
        y="48"
        fontFamily="Inter, -apple-system, sans-serif"
        fontSize="18"
        fontWeight="700"
        fill="#60A5FA"
        letterSpacing="-0.01em"
      >
        CODE
      </text>

      {/* Tagline */}
      <text
        x="105"
        y="85"
        fontFamily="Inter, -apple-system, sans-serif"
        fontSize="12"
        fontWeight="400"
        fill="#93C5FD"
        letterSpacing="0.03em"
      >
        Building smart solutions for a future digital world
      </text>

      {/* Glow Effect */}
      <defs>
        <radialGradient id="diamond-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#A5B4FC" />
          <stop offset="70%" stopColor="#93C5FD" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#60A5FA" stopOpacity="0" />
        </radialGradient>
        
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#60A5FA" />
        </filter>
      </defs>

      {/* Apply glow to diamond */}
      <use href="#diamond-glow" filter="url(#glow)" />
    </svg>
  );
}
