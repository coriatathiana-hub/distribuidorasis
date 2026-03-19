import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Resets scroll position on route changes.
 * Hash-based navigations are excluded to preserve in-page anchor behavior.
 */
const ScrollToTop = () => {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, search, hash]);

  return null;
};

export default ScrollToTop;
