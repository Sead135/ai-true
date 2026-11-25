type UploadIconProps = {
  className?: string;
};

export function UploadIcon({ className = "size-5" }: UploadIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path d="M12 16V6M8.5 9.5 12 6l3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 18h14" strokeLinecap="round" />
    </svg>
  );
}
