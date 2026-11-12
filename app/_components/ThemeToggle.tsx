"use client";

import React, { useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

type ViewTransitionDocument = Document & {
    startViewTransition?: (callback: () => void) => {
        ready: Promise<void>;
        finished: Promise<void>;
    };
};

const THEME_KEY = "theme";
const SPLASH_DURATION = 950;

const TAU = Math.PI * 2;
const MASK_POINTS = 72;
const MASK_CENTER = 500;
const MASK_BASE = 340;

// Radial distance from the mask centre to its edge at a given angle, in the
// mask's 0-1000 viewBox units. Shared by the SVG generator and the sizing
// calculation so both agree on the silhouette.
function splashRadius(angle: number) {
    const normalized = ((angle % TAU) + TAU) % TAU;
    const wobble =
        1 +
        0.17 * Math.sin(angle * 3 + 1.6) +
        0.08 * Math.sin(angle * 7 - 0.4) +
        0.035 * Math.sin(angle * 19 + 2.2);
    const index = Math.round((normalized / TAU) * MASK_POINTS) % MASK_POINTS;
    const spike = index % 9 === 0 ? 0.18 : index % 13 === 0 ? 0.1 : 0;

    return MASK_BASE * (wobble + spike);
}

// Draw a ragged ink-splash mask: one wobbly blob with scattered droplets
// ahead of the edge. The mask is scaled up from the click point, so the
// silhouette stays organic while it spreads across the page.
function buildSplashMask() {
    const path: string[] = [];

    for (let i = 0; i < MASK_POINTS; i++) {
        const angle = (i / MASK_POINTS) * TAU;
        const radius = splashRadius(angle);
        const x = (MASK_CENTER + Math.cos(angle) * radius).toFixed(1);
        const y = (MASK_CENTER + Math.sin(angle) * radius).toFixed(1);

        path.push(`${i === 0 ? "M" : "L"}${x} ${y}`);
    }

    path.push("Z");

    const droplets = Array.from({ length: 16 }, (_, i) => {
        const angle = (i / 16) * TAU + 0.35;
        const distance = MASK_BASE * (1.1 + 0.18 * Math.sin(i * 2.7));
        const radius = 7 + ((i * 7) % 14);
        const x = MASK_CENTER + Math.cos(angle) * distance;
        const y = MASK_CENTER + Math.sin(angle) * distance;
        return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(
            1
        )}" r="${radius}" />`;
    }).join("");

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><path d="${path.join(
        ""
    )}" fill="#fff"/>${droplets}</svg>`;

    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

const SPLASH_MASK = buildSplashMask();

function setThemeClass(isDark: boolean) {
    const root = document.documentElement;

    root.classList.toggle("dark", isDark);
    root.style.colorScheme = isDark ? "dark" : "light";
}

function applyTheme(isDark: boolean) {
    setThemeClass(isDark);

    try {
        localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
    } catch {
        // Private mode or storage disabled: the class still applies.
    }
}

function ThemeToggle() {
    // Keep other open tabs in sync with the chosen theme.
    useEffect(() => {
        const onStorage = (event: StorageEvent) => {
            if (event.key !== THEME_KEY || !event.newValue) return;
            setThemeClass(event.newValue === "dark");
        };

        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    const toggleTheme = (event: React.MouseEvent<HTMLButtonElement>) => {
        const root = document.documentElement;
        const isDark = root.classList.contains("dark");
        const nextIsDark = !isDark;

        const reduceMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;
        const doc = document as ViewTransitionDocument;

        // Older browsers and reduced-motion users get an instant switch.
        if (!doc.startViewTransition || reduceMotion) {
            applyTheme(nextIsDark);
            return;
        }

        const x = event.clientX;
        const y = event.clientY;
        const maxRadius = Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y)
        );

        const transition = doc.startViewTransition(() =>
            applyTheme(nextIsDark)
        );

        root.classList.add("theme-switching");
        const cleanup = () => root.classList.remove("theme-switching");
        transition.finished.then(cleanup, cleanup);
        // Safety net if the tab is hidden mid-transition.
        window.setTimeout(cleanup, SPLASH_DURATION + 600);

        const supportsSplash = CSS.supports("mask-size", "10px 10px");

        transition.ready
            .then(() => {
                if (supportsSplash) {
                    // Size the mask so its slowest lobe lands on the farthest
                    // screen corner at the end, keeping the whole spread visible
                    // instead of covering the page half-way through.
                    const size =
                        Math.max(
                            ...[
                                [0, 0],
                                [window.innerWidth, 0],
                                [0, window.innerHeight],
                                [
                                    window.innerWidth,
                                    window.innerHeight,
                                ],
                            ].map(([cornerX, cornerY]) => {
                                const dx = cornerX - x;
                                const dy = cornerY - y;
                                const distance = Math.hypot(dx, dy) || 1;

                                return (
                                    (distance * 1000) /
                                    splashRadius(Math.atan2(dy, dx))
                                );
                            })
                        ) * 1.04;

                    root.animate(
                        [
                            {
                                maskImage: SPLASH_MASK,
                                maskRepeat: "no-repeat",
                                maskPosition: `${x}px ${y}px`,
                                maskSize: "0px 0px",
                            },
                            {
                                maskImage: SPLASH_MASK,
                                maskRepeat: "no-repeat",
                                maskPosition: `${x - size / 2}px ${
                                    y - size / 2
                                }px`,
                                maskSize: `${size}px ${size}px`,
                            },
                        ],
                        {
                            duration: SPLASH_DURATION,
                            easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                            pseudoElement: "::view-transition-new(root)",
                        }
                    );
                } else {
                    // Fallback: a clean circle when masks are unavailable.
                    root.animate(
                        {
                            clipPath: [
                                `circle(0px at ${x}px ${y}px)`,
                                `circle(${maxRadius}px at ${x}px ${y}px)`,
                            ],
                        },
                        {
                            duration: SPLASH_DURATION,
                            easing: "cubic-bezier(0.65, 0, 0.35, 1)",
                            pseudoElement:
                                "::view-transition-new(root)",
                        }
                    );
                }
            })
            .catch(() => {
                // The theme was already applied; only the animation failed.
            });
    };

    return (
        <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            title="Toggle theme"
            className="relative overflow-hidden rounded-full"
        >
            <Sun className="h-[1.15rem] w-[1.15rem] rotate-0 scale-100 transition-all duration-500 motion-reduce:transition-none dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.15rem] w-[1.15rem] rotate-90 scale-0 transition-all duration-500 motion-reduce:transition-none dark:rotate-0 dark:scale-100" />

            <span className="sr-only dark:hidden">Switch to dark mode</span>
            <span className="sr-only hidden dark:inline">
                Switch to light mode
            </span>
        </Button>
    );
}

export default ThemeToggle;
