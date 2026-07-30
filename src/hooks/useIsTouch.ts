import { useEffect, useState } from "react";

/**
 * True on touch-primary devices (phones/tablets). Used to switch between the
 * desktop cursor star-trail and the mobile touch-heart interaction, and to
 * decide how the runaway button evades.
 */
export function useIsTouch(): boolean {
  const [isTouch, setIsTouch] = useState<boolean>(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(hover: none) and (pointer: coarse)").matches,
  );

  useEffect(() => {
    const mql = window.matchMedia("(hover: none) and (pointer: coarse)");
    const onChange = () => setIsTouch(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isTouch;
}
