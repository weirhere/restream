import * as React from "react";

type IconProps = React.SVGProps<SVGSVGElement>;

export function TwitchIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-[18px]" {...props}>
      <path d="M4.27 1.5 2 6.36v15.8h5.45V25h3.18l2.82-2.84h4.55L23.82 17V1.5H4.27Zm17.28 14.57-3.64 3.64h-5.45L9.28 22.8v-3.09H4.73V3.32h16.82v12.75Z" />
      <path d="M14.73 7.5h2.18v6.36h-2.18Zm-5.45 0h2.18v6.36H9.28Z" />
    </svg>
  );
}

export function YoutubeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-[18px]" {...props}>
      <path d="M23.5 6.5a3 3 0 0 0-2.1-2.12C19.6 4 12 4 12 4s-7.6 0-9.4.38A3 3 0 0 0 .5 6.5C.1 8.3.1 12 .1 12s0 3.7.4 5.5a3 3 0 0 0 2.1 2.12C4.4 20 12 20 12 20s7.6 0 9.4-.38a3 3 0 0 0 2.1-2.12c.4-1.8.4-5.5.4-5.5s0-3.7-.4-5.5Z" />
      <path d="m9.6 15.5 6.3-3.5-6.3-3.5Z" fill="var(--bg-base)" />
    </svg>
  );
}

export function FacebookIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-[18px]" {...props}>
      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.99 3.66 9.13 8.44 9.88V14.9H7.9V12h2.54V9.8c0-2.51 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.9h-2.34v6.98A10 10 0 0 0 22 12Z" />
    </svg>
  );
}

export function LinkedInIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-[18px]" {...props}>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.61 0 4.28 2.38 4.28 5.47v6.27ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.8 0 0 .78 0 1.73v20.53C0 23.22.8 24 1.77 24h20.45C23.2 24 24 23.22 24 22.27V1.73C24 .78 23.2 0 22.23 0Z" />
    </svg>
  );
}

export function KickIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-[18px]" {...props}>
      <path d="M0 3h6v6h2V6h2V3h4v4h2V4h6v8l-2 2v2l2 2v4h-6v-3h-2v-3h-2v3H8v-3H6v3H0V3Z" />
    </svg>
  );
}

export function XIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-[18px]" {...props}>
      <path d="M18.244 2H21.5l-7.52 8.59L22.5 22h-6.87l-5.38-7.04L3.95 22H.69l8.04-9.19L0 2h7.06l4.86 6.42L18.244 2Zm-2.41 18h1.95L6.27 4H4.21l11.624 16Z" />
    </svg>
  );
}
