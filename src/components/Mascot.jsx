/**
 * Bloop — the HabitFlow mascot. Pure SVG + CSS animations (theme-aware:
 * its body follows the active accent color).
 *
 * mood: 'happy' | 'wave' | 'sleep' | 'celebrate'
 */
export default function Mascot({ mood = 'happy', size = 120, className = '' }) {
  const isWave = mood === 'wave';
  const isSleep = mood === 'sleep';
  const isCelebrate = mood === 'celebrate';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={`mascot ${className}`}
      role="img"
      aria-label="Bloop, the HabitFlow mascot"
    >
      <defs>
        <linearGradient id="bloop-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" style={{ stopColor: 'rgb(var(--accent))' }} />
          <stop offset="100%" style={{ stopColor: 'rgb(var(--accent2))' }} />
        </linearGradient>
      </defs>

      {/* sprout leaves */}
      <g className="mascot-leaf">
        <path d="M60 22 C 55 8, 42 6, 38 12 C 44 14, 48 20, 50 24 Z" fill="#34d399" />
        <path d="M60 22 C 64 6, 78 4, 82 10 C 76 13, 71 19, 69 23 Z" fill="#10b981" />
      </g>

      {/* back arm */}
      {!isWave && !isCelebrate ? (
        <ellipse cx="22" cy="74" rx="9" ry="12" fill="url(#bloop-body)" opacity="0.85" />
      ) : (
        <g className={isCelebrate ? 'mascot-arm-wave' : ''}>
          <ellipse cx="20" cy="58" rx="9" ry="13" fill="url(#bloop-body)" opacity="0.85" transform="rotate(-35 20 58)" />
        </g>
      )}

      {/* body */}
      <path
        d="M60 24 C 86 24, 99 42, 99 64 C 99 89, 82 106, 60 106 C 38 106, 21 89, 21 64 C 21 42, 34 24, 60 24 Z"
        fill="url(#bloop-body)"
      />
      {/* belly highlight */}
      <ellipse cx="60" cy="82" rx="24" ry="16" fill="#fff" opacity="0.18" />

      {/* face */}
      {isSleep ? (
        <g stroke="#1e293b" strokeWidth="3" strokeLinecap="round" fill="none">
          <path d="M42 62 q 6 5 12 0" />
          <path d="M66 62 q 6 5 12 0" />
        </g>
      ) : (
        <g className="mascot-eyes">
          <circle cx="48" cy="60" r="6.2" fill="#fff" />
          <circle cx="48" cy="61" r="3" fill="#1e293b" />
          <circle cx="49.2" cy="59.6" r="1.1" fill="#fff" />
          <circle cx="72" cy="60" r="6.2" fill="#fff" />
          <circle cx="72" cy="61" r="3" fill="#1e293b" />
          <circle cx="73.2" cy="59.6" r="1.1" fill="#fff" />
        </g>
      )}

      {/* cheeks */}
      <ellipse cx="40" cy="71" rx="5" ry="3.4" fill="#fda4af" opacity="0.75" />
      <ellipse cx="80" cy="71" rx="5" ry="3.4" fill="#fda4af" opacity="0.75" />

      {/* mouth */}
      {isSleep ? (
        <ellipse cx="60" cy="76" rx="4.5" ry="5" fill="#1e293b" />
      ) : isCelebrate ? (
        <path d="M50 72 Q 60 84 70 72 Q 60 77 50 72 Z" fill="#1e293b" />
      ) : (
        <path d="M52 73 Q 60 82 68 73" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" fill="none" />
      )}

      {/* waving front arm */}
      {isWave ? (
        <g className="mascot-arm-wave">
          <ellipse cx="101" cy="52" rx="9" ry="13" fill="url(#bloop-body)" transform="rotate(25 101 52)" />
        </g>
      ) : null}

      {/* Zzz */}
      {isSleep ? (
        <g fill="rgb(var(--faint))" fontWeight="800" fontFamily="inherit" fontSize="12">
          <text x="96" y="34">z</text>
          <text x="104" y="24" fontSize="15">z</text>
        </g>
      ) : null}

      {/* celebrate sparkles */}
      {isCelebrate ? (
        <g fill="#fbbf24">
          <path d="M16 26 l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" />
          <path d="M102 18 l1.6 4 4 1.6-4 1.6-1.6 4-1.6-4-4-1.6 4-1.6z" />
          <circle cx="14" cy="48" r="2.4" />
          <circle cx="108" cy="44" r="2.4" />
        </g>
      ) : null}
    </svg>
  );
}
