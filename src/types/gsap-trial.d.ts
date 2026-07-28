// gsap-trial ships no type declarations for the SplitText plugin subpath,
// which breaks `tsc -b`. Declare it so the build can type-check.
declare module "gsap-trial/SplitText" {
  export class SplitText {
    constructor(target: unknown, vars?: Record<string, unknown>);
    chars: HTMLElement[];
    words: HTMLElement[];
    lines: HTMLElement[];
    revert(): this;
    split(vars?: Record<string, unknown>): this;
  }
  export default SplitText;
}
