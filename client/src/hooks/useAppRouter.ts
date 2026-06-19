import { useCallback, useEffect, useState } from 'react';
import type { AppRoute } from '../lib/routes';
import { navigateTo, parsePath, pathForRoute, replacePath } from '../lib/routes';

export function useAppRouter(onRouteChange: (route: AppRoute) => Promise<void>) {
  const [ready, setReady] = useState(false);

  const applyRoute = useCallback(
    async (route: AppRoute) => {
      await onRouteChange(route);
    },
    [onRouteChange],
  );

  useEffect(() => {
    let active = true;

    void applyRoute(parsePath(window.location.pathname)).finally(() => {
      if (active) setReady(true);
    });

    const onPopState = () => {
      void applyRoute(parsePath(window.location.pathname));
    };

    window.addEventListener('popstate', onPopState);
    return () => {
      active = false;
      window.removeEventListener('popstate', onPopState);
    };
  }, [applyRoute]);

  const goTo = useCallback(
    (route: AppRoute, replace = false) => {
      const path = pathForRoute(route);
      if (replace) {
        replacePath(path);
      } else {
        navigateTo(path);
      }
      void applyRoute(route);
    },
    [applyRoute],
  );

  return { ready, goTo };
}
