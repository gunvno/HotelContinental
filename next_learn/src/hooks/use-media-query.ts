import { useEffect, useState } from "react";

// Theo dõi trạng thái media query để xử lý UI responsive.

export function useMediaQuery(query: string) {
  const getMatches = () => window.matchMedia(query).matches;

  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return getMatches();
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const mediaQueryList = window.matchMedia(query);

    const listener = () => setMatches(mediaQueryList.matches);

    mediaQueryList.addEventListener("change", listener);
    listener();

    return () => mediaQueryList.removeEventListener("change", listener);
  }, [query]);

  return matches;
}
