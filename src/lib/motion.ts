import type { Transition, Variants } from "motion/react";

/** Ease curve tuned to feel snappy-but-soft — matches the tight SaaS energy. */
export const easeOutExpo: Transition["ease"] = [0.16, 1, 0.3, 1];

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
