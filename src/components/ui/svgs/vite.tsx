import type { SVGProps } from "react";

const Vite = (props: SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 256 256" preserveAspectRatio="xMidYMid">
    <defs>
      <linearGradient id="vite-a" x1="6%" x2="100%" y1="33%" y2="67%">
        <stop offset="0%" stopColor="#41D1FF" />
        <stop offset="100%" stopColor="#BD34FE" />
      </linearGradient>
      <linearGradient id="vite-b" x1="43%" x2="50%" y1="2%" y2="89%">
        <stop offset="0%" stopColor="#FFEA83" />
        <stop offset="8%" stopColor="#FFDD35" />
        <stop offset="100%" stopColor="#FFA800" />
      </linearGradient>
    </defs>
    <path
      fill="url(#vite-a)"
      d="M255.15 37.94 134.9 252.98c-2.48 4.44-8.86 4.47-11.38.06L.72 37.97c-2.75-4.81 1.36-10.64 6.8-9.65l120.4 21.51a6.4 6.4 0 0 0 2.28 0l118.1-21.48c5.43-.99 9.55 4.78 6.85 9.59Z"
    />
    <path
      fill="url(#vite-b)"
      d="M184.43.23 95.46 17.66a3.2 3.2 0 0 0-2.58 2.94l-5.47 92.34a3.2 3.2 0 0 0 3.92 3.27l24.76-5.71c2.32-.54 4.42 1.5 3.94 3.83l-7.35 35.96c-.5 2.42 1.78 4.48 4.14 3.75l15.3-4.72c2.36-.73 4.64 1.34 4.14 3.76l-11.7 56.6c-.73 3.55 3.98 5.48 5.95 2.44l1.32-2.03 72.54-144.78c1.21-2.42-.88-5.13-3.54-4.62l-25.49 4.91c-2.39.46-4.42-1.76-3.75-4.1l16.63-57.58c.67-2.34-1.4-4.55-3.79-4.08Z"
    />
  </svg>
);

export { Vite };
