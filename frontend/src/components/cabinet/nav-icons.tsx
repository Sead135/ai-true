type IconProps = {
  className?: string;
};

export function IconChart({ className = "size-4" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M4 19V5M4 19h16" strokeLinecap="round" />
      <path d="M8 16V10M12 16V7M16 16v-4" strokeLinecap="round" />
    </svg>
  );
}

export function IconUsers({ className = "size-4" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="9" cy="8" r="3" />
      <path d="M3 19c0-2.8 2.7-5 6-5s6 2.2 6 5" strokeLinecap="round" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M21 19c0-2-1.5-3.5-3.5-4" strokeLinecap="round" />
    </svg>
  );
}

export function IconBranch({ className = "size-4" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 3v10M12 13l-5 5M12 13l5 5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="3" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconReviews({ className = "size-4" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d="M7 18.5 4 21V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H7z"
        strokeLinejoin="round"
      />
      <path d="M8 9h8M8 12h5" strokeLinecap="round" />
    </svg>
  );
}

export function IconBuilding({ className = "size-4" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d="M4 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16M14 10h5a1 1 0 0 1 1 1v10"
        strokeLinejoin="round"
      />
      <path d="M7 8h2M7 12h2M7 16h2M16.5 14H18M16.5 17H18" strokeLinecap="round" />
    </svg>
  );
}
