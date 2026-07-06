import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll the app's main content container if present, otherwise window
    const container = document.querySelector('.main-content');
    if (container && typeof container.scrollTo === 'function') {
      try {
        container.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (e) {
        container.scrollTop = 0;
      }
      return;
    }

    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}
