import React from "react";

interface ProductVisualProps {
  type: "keyboard" | "headset" | "ring" | "server" | "camera" | "mouse";
  materialColor?: string;
  accentGlow?: string;
  engravingText?: string;
  engravingFont?: string;
  className?: string;
  interactive?: boolean;
}

export const ProductVisual: React.FC<ProductVisualProps> = ({
  type,
  materialColor = "#94a3b8",
  accentGlow = "#06b6d4",
  engravingText = "",
  engravingFont = "JetBrains Mono",
  className = "w-full h-48",
}) => {
  return (
    <div className={`relative flex items-center justify-center overflow-hidden bg-[#0d0d0d] p-4 border border-white/10 ${className}`}>
      {/* Background ambient glow */}
      <div
        className="absolute inset-0 opacity-20 blur-2xl transition-all duration-700 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${accentGlow} 0%, transparent 70%)` }}
      />

      {type === "keyboard" && (
        <svg viewBox="0 0 340 180" className="w-full h-full max-h-48 drop-shadow-xl select-none" fill="none">
          {/* Main Case */}
          <rect x="20" y="20" width="300" height="140" rx="12" fill={materialColor} stroke="#334155" strokeWidth="2" />
          <rect x="26" y="26" width="288" height="128" rx="8" fill="#0f172a" stroke="#1e293b" strokeWidth="1.5" />
          
          {/* Key rows grid */}
          <g fill="#1e293b" stroke="#334155" strokeWidth="1">
            {/* Function Row */}
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
              <rect key={`fn-${i}`} x={36 + i * 22} y={34} width="18" height="12" rx="2" />
            ))}
            {/* Number Row */}
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
              <rect key={`num-${i}`} x={36 + i * 22} y={50} width="18" height="16" rx="3" />
            ))}
            {/* QWERTY Row */}
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
              <rect key={`qw-${i}`} x={36 + i * 22} y={70} width="18" height="16" rx="3" />
            ))}
            {/* ASDF Row */}
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
              <rect key={`as-${i}`} x={36 + i * 22} y={90} width="18" height="16" rx="3" />
            ))}
            {/* Bottom Spacebar row */}
            <rect x="36" y="110" width="28" height="16" rx="3" />
            <rect x="68" y="110" width="22" height="16" rx="3" />
            <rect x="94" y="110" width="110" height="16" rx="3" fill="#334155" />
            <rect x="208" y="110" width="24" height="16" rx="3" />
            <rect x="236" y="110" width="22" height="16" rx="3" />
            <rect x="262" y="110" width="38" height="16" rx="3" />
          </g>

          {/* Underglow LED strip */}
          <line x1="30" y1="145" x2="310" y2="145" stroke={accentGlow} strokeWidth="3" strokeLinecap="round" filter="blur(1px)" />

          {/* Laser Engraving Plate on Top Right */}
          <rect x="210" y="32" width="90" height="14" rx="2" fill="#020617" stroke="#475569" strokeWidth="0.8" />
          <text
            x="255"
            y="42"
            fill={accentGlow}
            fontSize="7"
            fontFamily={engravingFont}
            textAnchor="middle"
            letterSpacing="1"
            className="font-bold uppercase select-none"
          >
            {engravingText ? engravingText.slice(0, 18) : "AURA // WEBMCP"}
          </text>
        </svg>
      )}

      {type === "headset" && (
        <svg viewBox="0 0 240 200" className="w-full h-full max-h-48 drop-shadow-xl select-none" fill="none">
          {/* Headband */}
          <path d="M 50 120 C 50 40, 190 40, 190 120" stroke={materialColor} strokeWidth="12" strokeLinecap="round" />
          <path d="M 70 95 C 70 55, 170 55, 170 95" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
          
          {/* Left Ear Cup */}
          <rect x="35" y="105" width="28" height="55" rx="14" fill={materialColor} stroke="#334155" strokeWidth="2" />
          <rect x="40" y="115" width="18" height="35" rx="8" fill="#0f172a" stroke={accentGlow} strokeWidth="1.5" />
          
          {/* Right Ear Cup */}
          <rect x="177" y="105" width="28" height="55" rx="14" fill={materialColor} stroke="#334155" strokeWidth="2" />
          <rect x="182" y="115" width="18" height="35" rx="8" fill="#0f172a" stroke={accentGlow} strokeWidth="1.5" />

          {/* Laser engraving on side plate */}
          <text
            x="120"
            y="48"
            fill={accentGlow}
            fontSize="8"
            fontFamily={engravingFont}
            textAnchor="middle"
            letterSpacing="1"
            className="font-semibold select-none"
          >
            {engravingText ? engravingText.slice(0, 14) : "VORTEX SPATIAL"}
          </text>
        </svg>
      )}

      {type === "ring" && (
        <svg viewBox="0 0 200 180" className="w-full h-full max-h-48 drop-shadow-xl select-none" fill="none">
          {/* Outer ring */}
          <ellipse cx="100" cy="90" rx="65" ry="55" fill="none" stroke={materialColor} strokeWidth="22" />
          {/* Inner ring */}
          <ellipse cx="100" cy="90" rx="52" ry="42" fill="none" stroke="#0f172a" strokeWidth="8" />
          {/* Optical sensor LED */}
          <circle cx="100" cy="136" r="5" fill={accentGlow} filter="blur(1px)" />
          <circle cx="90" cy="132" r="3" fill="#10b981" />
          <circle cx="110" cy="132" r="3" fill="#10b981" />

          {/* Engraved Band Text */}
          <text
            x="100"
            y="65"
            fill="#f8fafc"
            fontSize="8"
            fontFamily={engravingFont}
            textAnchor="middle"
            letterSpacing="2"
            className="font-mono select-none"
          >
            {engravingText ? engravingText.slice(0, 12) : "AETHER // 03"}
          </text>
        </svg>
      )}

      {type === "server" && (
        <svg viewBox="0 0 280 160" className="w-full h-full max-h-48 drop-shadow-xl select-none" fill="none">
          {/* 1U Chassis */}
          <rect x="20" y="35" width="240" height="90" rx="6" fill="#0f172a" stroke={materialColor} strokeWidth="3" />
          {/* NVMe Bay slots */}
          {[0, 1, 2, 3].map((i) => (
            <g key={`nvme-${i}`}>
              <rect x={35 + i * 42} y="50" width="36" height="55" rx="3" fill="#1e293b" stroke="#334155" strokeWidth="1" />
              <circle cx={43 + i * 42} cy="95" r="2.5" fill={accentGlow} />
              <line x1={40 + i * 42} y1="60" x2={65 + i * 42} y2="60" stroke="#475569" strokeWidth="1" />
              <line x1={40 + i * 42} y1="66" x2={65 + i * 42} y2="66" stroke="#475569" strokeWidth="1" />
            </g>
          ))}
          {/* Fan & Status LCD */}
          <rect x="210" y="50" width="38" height="28" rx="2" fill="#020617" stroke="#334155" strokeWidth="1" />
          <text x="229" y="66" fill={accentGlow} fontSize="7" fontFamily="monospace" textAnchor="middle">
            LIVE
          </text>
          {/* Status lights */}
          <circle cx="218" cy="95" r="3" fill="#10b981" />
          <circle cx="230" cy="95" r="3" fill={accentGlow} />
          <circle cx="242" cy="95" r="3" fill="#f59e0b" />
        </svg>
      )}

      {type === "camera" && (
        <svg viewBox="0 0 220 160" className="w-full h-full max-h-48 drop-shadow-xl select-none" fill="none">
          {/* Camera body */}
          <rect x="30" y="45" width="160" height="70" rx="10" fill="#0f172a" stroke={materialColor} strokeWidth="3" />
          {/* Lens Barrel */}
          <circle cx="110" cy="80" r="30" fill="#1e293b" stroke="#475569" strokeWidth="3" />
          <circle cx="110" cy="80" r="20" fill="#020617" stroke={accentGlow} strokeWidth="2" />
          <circle cx="104" cy="74" r="5" fill="#ffffff" opacity="0.6" />
          {/* Tally Light */}
          <circle cx="165" cy="60" r="4" fill="#ef4444" />
          <text x="55" y="62" fill="#94a3b8" fontSize="7" fontFamily="monospace">
            4K HDR
          </text>
        </svg>
      )}

      {type === "mouse" && (
        <svg viewBox="0 0 180 180" className="w-full h-full max-h-48 drop-shadow-xl select-none" fill="none">
          {/* Ergonomic mouse shell */}
          <path
            d="M 90 25 C 60 25, 45 60, 45 110 C 45 150, 65 160, 90 160 C 115 160, 135 150, 135 110 C 135 60, 120 25, 90 25 Z"
            fill="#0f172a"
            stroke={materialColor}
            strokeWidth="3"
          />
          {/* Split buttons line */}
          <line x1="90" y1="26" x2="90" y2="85" stroke="#334155" strokeWidth="2" />
          {/* Scroll Wheel */}
          <rect x="85" y="45" width="10" height="24" rx="4" fill={materialColor} stroke={accentGlow} strokeWidth="1.5" />
          {/* Honeycomb lattice holes */}
          <circle cx="75" cy="115" r="3" fill="#1e293b" />
          <circle cx="90" cy="115" r="3" fill="#1e293b" />
          <circle cx="105" cy="115" r="3" fill="#1e293b" />
          <circle cx="82" cy="128" r="3" fill="#1e293b" />
          <circle cx="98" cy="128" r="3" fill="#1e293b" />
          {/* Underglow strip */}
          <path d="M 60 148 C 75 156, 105 156, 120 148" stroke={accentGlow} strokeWidth="3" strokeLinecap="round" />
        </svg>
      )}
    </div>
  );
};
