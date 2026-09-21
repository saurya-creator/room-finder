"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sun, Moon, Zap, Check } from "lucide-react";
import { useTheme, Theme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const options: { id: Theme; label: string; desc: string; icon: React.ReactNode; color: string }[] = [
    {
      id: "light",
      label: "Light",
      desc: "Clean & crisp slate",
      icon: <Sun className="w-4 h-4 text-amber-500" />,
      color: "from-amber-400 to-amber-500",
    },
    {
      id: "dark",
      label: "Dark",
      desc: "Deep navy & slate",
      icon: <Moon className="w-4 h-4 text-indigo-400" />,
      color: "from-indigo-500 to-slate-700",
    },
    {
      id: "amoled",
      label: "AMOLED",
      desc: "True pitch #000000 black",
      icon: <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400" />,
      color: "from-emerald-500 to-zinc-900",
    },
  ];

  const currentOption = options.find((o) => o.id === theme) || options[0];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 amoled:border-zinc-800 bg-white/80 dark:bg-slate-900/80 amoled:bg-black/90 hover:border-slate-300 dark:hover:border-slate-700 amoled:hover:border-zinc-700 shadow-sm backdrop-blur-md transition-all text-xs font-semibold text-slate-700 dark:text-slate-200 amoled:text-white"
        title={`Theme: ${currentOption.label} mode. Click to change.`}
      >
        <span className="flex items-center justify-center">
          {currentOption.icon}
        </span>
        <span className="hidden sm:inline capitalize">{currentOption.label}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 amoled:bg-zinc-950 border border-slate-200 dark:border-slate-800 amoled:border-zinc-800 shadow-floating p-1.5 z-50 animate-slide-up">
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/60 amoled:border-zinc-900">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Appearance Theme
            </p>
          </div>

          <div className="py-1 space-y-1">
            {options.map((option) => {
              const isActive = theme === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => {
                    setTheme(option.id);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all ${
                    isActive
                      ? "bg-brand-50 dark:bg-brand-950/40 amoled:bg-zinc-900 text-brand-700 dark:text-brand-300 amoled:text-brand-400 font-semibold"
                      : "text-slate-700 dark:text-slate-300 amoled:text-zinc-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 amoled:hover:bg-zinc-900/60"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 amoled:bg-zinc-900">
                      {option.icon}
                    </div>
                    <div>
                      <div className="text-xs font-semibold">{option.label}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">
                        {option.desc}
                      </div>
                    </div>
                  </div>
                  {isActive && <Check className="w-4 h-4 text-brand-600 shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="mt-1 pt-1.5 border-t border-slate-100 dark:border-slate-800/60 amoled:border-zinc-900 px-3 py-1">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
              ⚡ AMOLED saves OLED battery
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
