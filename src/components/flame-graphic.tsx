// Decorative flame silhouette — the recurring graphic device from the print
// campaign (white flame cut from a red panel, or a red flame outline on
// cream). Pure shape, tinted via `fill`/currentColor so it drops into any
// hero panel or celebration screen.
export function FlameGraphic({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 240"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path
        d="M100,8
           C122,38 108,54 129,70
           C162,92 172,132 149,167
           C171,152 186,119 180,88
           C211,120 217,172 191,208
           C169,233 138,242 108,239
           C68,236 28,214 18,178
           C8,146 20,112 46,93
           C35,119 41,146 56,152
           C49,120 61,88 86,63
           C77,84 80,101 91,96
           C84,70 90,38 100,8 Z"
      />
    </svg>
  );
}
