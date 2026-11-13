export default function WinterScene() {
  return (
    <svg
      className="winter-scene"
      viewBox="0 0 760 590"
      role="img"
      aria-label="A quiet winter landscape with rolling snowy hills, pine trees, and a snowman holding a glowing lantern"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="backHill" x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#8ca7bf" stopOpacity=".52" />
          <stop offset="1" stopColor="#344f6a" stopOpacity=".34" />
        </linearGradient>
        <linearGradient id="frontHill" x1="0.1" y1="0" x2="0.7" y2="1">
          <stop offset="0" stopColor="#c7d8e5" stopOpacity=".87" />
          <stop offset="1" stopColor="#6f8ba5" stopOpacity=".65" />
        </linearGradient>
        <linearGradient id="snowman" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f7fbff" />
          <stop offset="1" stopColor="#a8bfd2" />
        </linearGradient>
        <radialGradient id="lanternHalo">
          <stop offset="0" stopColor="#ffbd6a" stopOpacity=".42" />
          <stop offset="1" stopColor="#ffbd6a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="lanternGlass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffd08a" />
          <stop offset="1" stopColor="#d96b36" />
        </linearGradient>
      </defs>

      {/* Distant ridge and moonlit sky details */}
      <g fill="#d7e5f0" opacity=".65">
        <circle cx="545" cy="86" r="2" /><circle cx="608" cy="126" r="1.4" />
        <circle cx="428" cy="112" r="1.5" /><circle cx="694" cy="177" r="1.8" />
        <circle cx="366" cy="175" r="1.1" /><circle cx="503" cy="202" r="1.2" />
      </g>
      <path d="M0 350 115 245l83 79 115-143 107 130 99-91 90 95 76-60 75 83v252H0Z" fill="#657f98" opacity=".36" />
      <path d="m78 321 120-117 115 111 87-102 128 122 95-75 104 91v180H78Z" fill="url(#backHill)" />
      <path d="M0 405c116-60 206-44 310-13 104 31 181 9 271-29 70-30 128-34 179-12v239H0Z" fill="#d5e3ed" opacity=".16" />

      {/* Pine silhouettes */}
      <g fill="#10283b" opacity=".92">
        <path d="m82 422 42-92 42 92h-25l40 76H66l40-76Z" />
        <path d="m170 443 30-68 31 68h-18l31 59h-88l31-59Z" opacity=".8" />
        <path d="m570 404 46-103 47 103h-27l42 78H555l42-78Z" />
        <path d="m655 440 30-70 31 70h-18l33 62h-92l33-62Z" opacity=".82" />
      </g>
      <g fill="#b9d0df" opacity=".8">
        <path d="m124 330 13 29h-26Z" /><path d="m200 375 12 25h-24Z" />
        <path d="m616 304 14 31h-28Z" /><path d="m686 370 12 26h-24Z" />
      </g>

      {/* Foreground snow banks */}
      <path d="M0 486c115-55 226-43 330-9 115 38 224 24 430-41v154H0Z" fill="url(#frontHill)" opacity=".67" />
      <path d="M0 527c118-34 223-18 331 12 125 35 271 8 429-31v82H0Z" fill="#d9e7f0" opacity=".52" />
      <path d="M0 555c150-22 248 7 371 11 145 4 265-25 389-40v64H0Z" fill="#edf4f8" opacity=".18" />

      {/* Snowman shadow and body */}
      <ellipse cx="405" cy="526" rx="89" ry="18" fill="#203e58" opacity=".32" />
      <circle cx="405" cy="447" r="67" fill="url(#snowman)" />
      <circle cx="405" cy="346" r="49" fill="url(#snowman)" />
      <circle cx="405" cy="271" r="35" fill="url(#snowman)" />
      <path d="M375 244h60l-7-27h-46Z" fill="#172d40" />
      <path d="M365 217h80v11h-80Z" fill="#243f56" />
      <path d="M376 327c17 11 42 13 59-1l6 14c-19 17-51 14-70 0Z" fill="#b45b43" />
      <path d="M428 337c11 30 3 45-10 52" fill="none" stroke="#b45b43" strokeWidth="8" strokeLinecap="round" />
      <g fill="#20394c">
        <circle cx="393" cy="269" r="3.5" /><circle cx="417" cy="269" r="3.5" />
        <circle cx="405" cy="281" r="4.8" fill="#bd704c" />
        <circle cx="405" cy="420" r="4" /><circle cx="405" cy="447" r="4" />
      </g>
      <path d="M367 424c-24-21-38-19-50-14m118 7c20-22 32-26 46-25" fill="none" stroke="#654a3c" strokeWidth="7" strokeLinecap="round" />
      <path d="m321 409-17-14m17 14 1-20m160 2 17-13m-17 13 1-21" fill="none" stroke="#654a3c" strokeWidth="5" strokeLinecap="round" />

      {/* Lantern glow and handle */}
      <circle cx="499" cy="381" r="83" fill="url(#lanternHalo)" className="lantern-halo" />
      <path d="M489 357c0-18 20-26 29-12" fill="none" stroke="#5a4638" strokeWidth="4" strokeLinecap="round" />
      <path d="m483 366 37 0-4 52h-29Z" fill="#243d51" stroke="#c58a55" strokeWidth="2" />
      <path d="m488 371 27 0-3 40h-21Z" fill="url(#lanternGlass)" className="lantern-flame" />
      <path d="m496 380 10-9 8 9-4 16h-11Z" fill="#fff0bd" opacity=".82" className="lantern-flame-core" />
      <path d="M479 364h45m-39 55h32" stroke="#d29a62" strokeWidth="3" strokeLinecap="round" />
      <path d="M485 418h31" stroke="#1c354a" strokeWidth="4" strokeLinecap="round" />

      {/* Tiny drifts */}
      <g fill="#f3f8fb" opacity=".78">
        <circle cx="93" cy="515" r="2" /><circle cx="148" cy="540" r="1.5" />
        <circle cx="259" cy="493" r="1.7" /><circle cx="573" cy="525" r="2" />
        <circle cx="665" cy="507" r="1.4" />
      </g>
    </svg>
  );
}
