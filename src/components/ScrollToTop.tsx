import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { isDebugFlagEnabled } from '@/config/debugFlags';

export default function ScrollToTop() {
  const { pathname, search } = useLocation();
  const navType = useNavigationType();
  const prevRef = useRef({ pathname: '', search: '' });

  const emit = (msg: string) => {
    console.log(msg);
    (window as any).__debugEvent && (window as any).__debugEvent(msg);
  };

  useEffect(() => {
    const prev = prevRef.current;
    
    emit(`[SCROLL-TO-TOP] navType=${navType} pathname=${pathname} search=${search}`);

    // ALWAYS ignore search-only changes (not just when debug flag is on)
    const onlySearchChanged = prev.pathname === pathname && prev.search !== search;
    if (onlySearchChanged) {
      emit('[SCROLL-TO-TOP] skipped due to search-only change');
      prevRef.current = { pathname, search };
      return;
    }

    // Only scroll to top on pathname changes with user navigation
    // Ignore periodic data updates by checking if this is an actual navigation
    const pathnameChanged = prev.pathname !== pathname;
    if (pathnameChanged && navType === 'PUSH') {
      emit('[SCROLL-TO-TOP] scrolling to top - pathname changed');
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    } else if (!pathnameChanged) {
      emit('[SCROLL-TO-TOP] skipped - no pathname change (likely data update)');
    }

    prevRef.current = { pathname, search };
  }, [pathname, search, navType]);

  return null;
}
