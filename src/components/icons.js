// Lightweight inline SVG icons (stroke-based, inherit currentColor).

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

export function SearchIcon({ className = "size-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} strokeWidth={2}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function ChevronDownIcon({ className = "size-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} strokeWidth={2}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function ChevronRightIcon({ className = "size-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} strokeWidth={2.5}>
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

export function InfoIcon({ className = "size-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </svg>
  );
}

export function BagIcon({ className = "size-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M5 8h14l-1 12H6L5 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

export function UserIcon({ className = "size-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

export function MenuIcon({ className = "size-6" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} strokeWidth={2}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function CloseIcon({ className = "size-6" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} strokeWidth={2}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function PhoneIcon({ className = "size-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
      <path d="M10.5 18h3" />
    </svg>
  );
}

export function MailIcon({ className = "size-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 6.5 8.5 6 8.5-6" />
    </svg>
  );
}

export function PinIcon({ className = "size-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M12 21s-7-6.1-7-11.5a7 7 0 0 1 14 0C19 14.9 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}

// Brand marks (social links)
export function XLogoIcon({ className = "size-6" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.77L17.75 3Zm-1.08 16.17h1.7L7.4 4.74H5.58l11.09 14.43Z" />
    </svg>
  );
}

export function SnapchatIcon({ className = "size-6" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M12 3c2.9 0 5 2.2 5 5.2v2.6l1.6-.5c.6-.2 1.1.6.5 1l-1.8 1.1c.6 1.6 1.8 2.9 3.4 3.5-.4.8-1.4 1.1-2.4 1.3l-.4 1.3c-1-.2-2-.1-2.9.4-.9.5-1.9 1.1-3 1.1s-2.1-.6-3-1.1c-.9-.5-1.9-.6-2.9-.4l-.4-1.3c-1-.2-2-.5-2.4-1.3 1.6-.6 2.8-1.9 3.4-3.5L4.9 11.3c-.6-.4-.1-1.2.5-1l1.6.5V8.2C7 5.2 9.1 3 12 3Z" />
    </svg>
  );
}

export function InstagramIcon({ className = "size-6" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} strokeWidth={1.8}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="0.6" fill="currentColor" />
    </svg>
  );
}
