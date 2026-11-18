"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "../button/Button";
import { THEME_OPTIONS } from "../../tokens/theme";
import { useTheme } from "./ThemeProvider";

export function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    function closeOnOutsideClick(event: PointerEvent) {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <div className="relative" ref={root}>
      <Button
        aria-expanded={open}
        className="h-11 min-h-11 gap-2 px-3 text-sm"
        onClick={() => setOpen((current) => !current)}
        variant="secondary"
      >
        <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 24 24" width="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7">
          <path d="M12 3a9 9 0 1 0 0 18h1.2a2 2 0 0 0 1.5-3.3 1.8 1.8 0 0 1 1.4-3h.7A4.2 4.2 0 0 0 21 10.5C21 6.4 17 3 12 3Z" />
          <circle cx="7.5" cy="10" r="1" /><circle cx="10" cy="6.8" r="1" /><circle cx="15" cy="7" r="1" />
        </svg>
        Thème
      </Button>
      {open && (
        <div aria-label="Choisir un thème de couleur" className="absolute right-0 top-[calc(100%+8px)] z-50 w-48 rounded-card border border-border bg-surface p-2 shadow-xl" role="group">
          <p className="px-2 pb-1 pt-1 text-xs font-medium text-text-secondary">Couleur de la plateforme</p>
          {THEME_OPTIONS.map((option) => (
            <button
              aria-pressed={theme === option.value}
              className="flex min-h-10 w-full cursor-pointer items-center gap-3 rounded-field border-0 bg-surface px-2 text-left text-sm text-text hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-focus"
              key={option.value}
              onClick={() => { setTheme(option.value); setOpen(false); }}
              type="button"
            >
              <span aria-hidden="true" className="grid h-5 w-5 place-items-center rounded-full border border-border" data-theme={option.value}>
                <span className="h-3 w-3 rounded-full bg-accent" />
              </span>
              <span className="flex-1">{option.label}</span>
              {theme === option.value && <span aria-hidden="true" className="font-semibold text-accent">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
