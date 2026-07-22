// Lightweight inline SVG icon set (stroke style, 24x24, lucide-inspired).
function I({ children, className = 'h-5 w-5', strokeWidth = 2, viewBox = '0 0 24 24' }) {
  return (
    <svg
      className={className}
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const IconLogo = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#hflogo)" />
    <path d="M7 12.5l3.2 3.2L17 8.9" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    <defs>
      <linearGradient id="hflogo" x1="2" y1="2" x2="22" y2="22">
        <stop stopColor="#6366f1" />
        <stop offset="1" stopColor="#8b5cf6" />
      </linearGradient>
    </defs>
  </svg>
);

export const IconDashboard = ({ className }) => (
  <I className={className}>
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </I>
);

export const IconHabits = ({ className }) => (
  <I className={className}>
    <path d="M4 6l1.2 1.2L7.5 5" />
    <path d="M11 6h9" />
    <path d="M4 12l1.2 1.2L7.5 11" />
    <path d="M11 12h9" />
    <path d="M4 18l1.2 1.2L7.5 17" />
    <path d="M11 18h9" />
  </I>
);

export const IconChart = ({ className }) => (
  <I className={className}>
    <path d="M3 3v16a2 2 0 0 0 2 2h16" />
    <path d="M7 15v-4" />
    <path d="M12 17V7" />
    <path d="M17 13v-6" />
  </I>
);

export const IconJournal = ({ className }) => (
  <I className={className}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4a2 2 0 0 0-2-2H6.5A2.5 2.5 0 0 0 4 4.5v15z" />
    <path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" />
  </I>
);

export const IconTrophy = ({ className }) => (
  <I className={className}>
    <path d="M8 21h8" />
    <path d="M12 17v4" />
    <path d="M7 4h10v6a5 5 0 0 1-10 0V4z" />
    <path d="M7 6H4a1 1 0 0 0-1 1c0 2.2 1.8 4 4 4" />
    <path d="M17 6h3a1 1 0 0 1 1 1c0 2.2-1.8 4-4 4" />
  </I>
);

export const IconPlus = ({ className }) => (
  <I className={className}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </I>
);

export const IconCheck = ({ className }) => (
  <I className={className}>
    <path d="M4 12.5l5 5L20 6.5" />
  </I>
);

export const IconFlame = ({ className }) => (
  <I className={className}>
    <path d="M12 22c3.9 0 7-3 7-6.8 0-3-1.9-4.9-3.4-6.7C14.3 6.9 13.5 5.4 13.5 2c-3 2.2-4.4 4.9-4.4 7.4 0 1.2.3 2.3.8 3.4-.9-.5-1.6-1.3-1.9-2.6C6.3 11.7 5 13.6 5 15.2 5 19 8.1 22 12 22z" />
  </I>
);

export const IconCalendar = ({ className }) => (
  <I className={className}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M16 3v4" />
    <path d="M8 3v4" />
    <path d="M3 11h18" />
  </I>
);

export const IconTarget = ({ className }) => (
  <I className={className}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1" />
  </I>
);

export const IconSparkles = ({ className }) => (
  <I className={className}>
    <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" />
    <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z" />
  </I>
);

export const IconX = ({ className }) => (
  <I className={className}>
    <path d="M18 6L6 18" />
    <path d="M6 6l12 12" />
  </I>
);

export const IconMenu = ({ className }) => (
  <I className={className}>
    <path d="M4 6h16" />
    <path d="M4 12h16" />
    <path d="M4 18h16" />
  </I>
);

export const IconLogout = ({ className }) => (
  <I className={className}>
    <path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </I>
);

export const IconChevronDown = ({ className }) => (
  <I className={className}>
    <path d="M6 9l6 6 6-6" />
  </I>
);

export const IconChevronLeft = ({ className }) => (
  <I className={className}>
    <path d="M15 18l-6-6 6-6" />
  </I>
);

export const IconChevronRight = ({ className }) => (
  <I className={className}>
    <path d="M9 18l6-6-6-6" />
  </I>
);

export const IconPencil = ({ className }) => (
  <I className={className}>
    <path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </I>
);

export const IconTrash = ({ className }) => (
  <I className={className}>
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
  </I>
);

export const IconArchive = ({ className }) => (
  <I className={className}>
    <rect x="2" y="3" width="20" height="5" rx="1" />
    <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
    <path d="M10 12h4" />
  </I>
);

export const IconClock = ({ className }) => (
  <I className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </I>
);

export const IconTrendingUp = ({ className }) => (
  <I className={className}>
    <path d="M22 7l-8.5 8.5-5-5L2 17" />
    <path d="M16 7h6v6" />
  </I>
);

export const IconMoon = ({ className }) => (
  <I className={className}>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </I>
);

export const IconUser = ({ className }) => (
  <I className={className}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
  </I>
);

export const IconRefresh = ({ className }) => (
  <I className={className}>
    <path d="M21 2v6h-6" />
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
    <path d="M3 22v-6h6" />
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
  </I>
);

export const IconBook = ({ className }) => (
  <I className={className}>
    <path d="M12 6c-1.5-1.8-4-2.5-8-2.5v15c4 0 6.5.7 8 2.5 1.5-1.8 4-2.5 8-2.5v-15c-4 0-6.5.7-8 2.5z" />
    <path d="M12 6v15" />
  </I>
);

export const IconSettings = ({ className }) => (
  <I className={className}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.11-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.65 8.9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.54a1.7 1.7 0 0 0 1.03-1.56V3a2 2 0 1 1 4 0v.09c0 .68.4 1.3 1.01 1.56a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87c.25.61.88 1.03 1.56 1.03H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1z" />
  </I>
);

export const ICON_MAP = {
  target: IconTarget,
  calendar: IconCalendar,
  flame: IconFlame,
  sparkles: IconSparkles,
  trophy: IconTrophy,
};
