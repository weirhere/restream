import type { Transition, Variants } from "motion/react";

/** Ease curve tuned to feel snappy-but-soft — the tight SaaS energy. */
export const easeOutExpo: Transition["ease"] = [0.16, 1, 0.3, 1];

/* ─────────────────────────────────────────────────────────────
 * SPRING PRESETS (3-tier system)
 *
 *   snap    — quick state changes (layout reorder, chip enter)
 *   soft    — progress/bar growth, value interpolation
 *   gentle  — expansions, reveals, contained height changes
 *
 * Prefer these by name over raw stiffness/damping. Consistency
 * across related interactions is what reads as "one motion voice."
 * ──────────────────────────────────────────────────────────── */

export const springSnap: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 28,
};

export const springSoft: Transition = {
  type: "spring",
  stiffness: 240,
  damping: 32,
};

export const springGentle: Transition = {
  type: "spring",
  stiffness: 180,
  damping: 30,
};

/** Default reveal duration for height/opacity collapses. */
export const revealDuration = 0.25;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOutExpo },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: easeOutExpo },
  },
};

/** Parent container — staggers its children's entry. */
export const stagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

/** Slightly tighter stagger for dense grids. */
export const staggerTight: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.035, delayChildren: 0.02 },
  },
};

/** Route-level transition. */
export const pageIn: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: easeOutExpo },
  },
};

/** Subtle breathing pulse for armed Go Live button. */
export const breath: Transition = {
  duration: 1.8,
  repeat: Infinity,
  repeatType: "mirror",
  ease: "easeInOut",
};
