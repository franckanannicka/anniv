/** Random float in [min, max). */
export const rand = (min: number, max: number): number =>
  Math.random() * (max - min) + min;

/** Random integer in [min, max]. */
export const randInt = (min: number, max: number): number =>
  Math.floor(rand(min, max + 1));

/** Pick a random element from an array. */
export const pick = <T,>(arr: readonly T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];
