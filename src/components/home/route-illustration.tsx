/** Original abstract route illustration — warehouse to destination pin with an animated dashed path. */
export function RouteIllustration() {
  return (
    <svg
      viewBox="0 0 800 220"
      className="pointer-events-none absolute inset-x-0 top-2 mx-auto hidden w-full max-w-5xl opacity-[0.5] sm:block"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M70 160 C 240 40, 560 40, 730 130"
        stroke="white"
        strokeWidth="2"
        className="animate-dash"
        strokeLinecap="round"
      />
      <g transform="translate(70,160)">
        <circle r="16" fill="white" fillOpacity="0.12" className="animate-pulse-ring" />
        <rect x="-10" y="-9" width="20" height="16" rx="2" fill="white" fillOpacity="0.9" />
        <rect x="-6" y="-14" width="12" height="6" rx="1" fill="white" fillOpacity="0.9" />
      </g>
      <g transform="translate(730,130)">
        <circle r="16" fill="white" fillOpacity="0.12" className="animate-pulse-ring" style={{ animationDelay: "0.6s" }} />
        <path
          d="M0 -14 C 8 -14 14 -8 14 0 C 14 10 0 20 0 20 C 0 20 -14 10 -14 0 C -14 -8 -8 -14 0 -14 Z"
          fill="white"
          fillOpacity="0.9"
        />
        <circle r="4" fill="#5b5df0" />
      </g>
    </svg>
  );
}
