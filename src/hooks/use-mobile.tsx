
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        setIsMobile(false);
        return;
      }

      const mql = window?.matchMedia?.(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
      if (!mql) {
        // Fallback for browsers that don't support matchMedia
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
        return;
      }
      
      const onChange = () => {
        try {
          setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
        } catch (e) {
          console.warn("Mobile detection onChange failed:", e);
        }
      };
      
      // Use optional chaining and check if addEventListener exists
      if (mql.addEventListener) {
        mql.addEventListener("change", onChange);
      } else if ((mql as any).addListener) {
        // Fallback for older browsers
        (mql as any).addListener(onChange);
      }
      
      // Set initial value
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
      
      return () => {
        try {
          if (mql.removeEventListener) {
            mql.removeEventListener("change", onChange);
          } else if ((mql as any).removeListener) {
            // Fallback for older browsers
            (mql as any).removeListener(onChange);
          }
        } catch (e) {
          console.warn("Mobile detection cleanup failed:", e);
        }
      };
    } catch (e) {
      console.warn("Mobile detection failed:", e);
      setIsMobile(false);
    }
  }, [])

  return !!isMobile
}
