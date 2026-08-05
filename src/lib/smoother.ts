import type { ScrollSmoother } from "gsap/ScrollSmoother";

let smoother: ScrollSmoother | null = null;

export const setSmoother = (instance: ScrollSmoother | null) => {
  smoother = instance;
};

export const getSmoother = () => smoother;
