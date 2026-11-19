/* ============================================================================
   Site header: wordmark left, nav right. Collapses to a menu button on mobile.
   Links go nowhere (this is a prototype).
   ============================================================================ */

import { useState } from "react";
import { Wordmark } from "./Wordmark";

const NAV = ["Become an Owner", "Help", "Favorites", "Login"];

export function Header({ mobile = false }: { mobile?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur">
      <div
        className={[
          "mx-auto flex max-w-6xl items-center justify-between py-3",
          mobile ? "px-5" : "px-4 sm:px-6",
        ].join(" ")}
      >
        <a href="#top" className="rounded-md" aria-label="Evolve home">
          <Wordmark />
        </a>

        {/* desktop nav */}
        <nav
          className={mobile ? "hidden" : "hidden items-center gap-7 md:flex"}
          aria-label="Primary"
        >
          {NAV.map((item) => (
            <a
              key={item}
              href="#"
              onClick={(e) => e.preventDefault()}
              className="text-[15px] font-semibold text-ink hover:text-action"
            >
              {item}
            </a>
          ))}
        </nav>

        {/* mobile toggle */}
        <button
          type="button"
          className={[
            "flex h-11 w-11 items-center justify-center rounded-md border-[1.5px] border-line text-ink",
            mobile ? "" : "md:hidden",
          ].join(" ")}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
            {open ? (
              <path
                d="M5 5l12 12M17 5L5 17"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M4 6h14M4 11h14M4 16h14"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Primary"
          className={["border-t border-line bg-surface", mobile ? "" : "md:hidden"].join(" ")}
        >
          <ul className="mx-auto flex max-w-6xl flex-col px-4 py-2">
            {NAV.map((item) => (
              <li key={item}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setOpen(false);
                  }}
                  className="block py-3 text-[16px] font-semibold text-ink"
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
