import { useCallback, useRef, useEffect } from 'react';
import { InteractionManager, BackHandler } from 'react-native';
import { useRouter, usePathname } from 'expo-router';

interface NavigationOptions {
  preloadRoutes?: string[];
  enableBackHandling?: boolean;
  trackAnalytics?: boolean;
}

export function useNavigationOptimization(options: NavigationOptions = {}) {
  const {
    preloadRoutes = [],
    enableBackHandling = true,
    trackAnalytics = false,
  } = options;

  const router = useRouter();
  const pathname = usePathname();
  const navigationTimeRef = useRef<number>(0);
  const preloadedRoutesRef = useRef<Set<string>>(new Set());

  // Optimized navigation with interaction manager
  const navigateOptimized = useCallback((route: string, params?: any) => {
    navigationTimeRef.current = Date.now();
    
    InteractionManager.runAfterInteractions(() => {
      if (trackAnalytics) {
        navigationTimeRef.current = Date.now();
      }
      
      router.push({ pathname: route as any, params });
    });
  }, [router, pathname, trackAnalytics]);

  // Replace current route optimized
  const replaceOptimized = useCallback((route: string, params?: any) => {
    InteractionManager.runAfterInteractions(() => {
      router.replace({ pathname: route as any, params });
    });
  }, [router]);

  // Go back with optimization
  const goBackOptimized = useCallback(() => {
    InteractionManager.runAfterInteractions(() => {
      if (router.canGoBack()) {
        router.back();
      } else {
        // Fallback to home if can't go back
        router.replace('/');
      }
    });
  }, [router]);

  // Preload routes for better performance
  const preloadRoute = useCallback((route: string) => {
    if (!preloadedRoutesRef.current.has(route)) {
      preloadedRoutesRef.current.add(route);
    }
  }, []);

  // Handle Android back button
  useEffect(() => {
    if (!enableBackHandling) return;

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (router.canGoBack()) {
        goBackOptimized();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [enableBackHandling, goBackOptimized, router]);

  // Preload specified routes on mount
  useEffect(() => {
    preloadRoutes.forEach(route => {
      preloadRoute(route);
    });
  }, [preloadRoutes, preloadRoute]);

  // Calculate navigation performance
  const getNavigationTime = useCallback(() => {
    return Date.now() - navigationTimeRef.current;
  }, []);

  return {
    navigateOptimized,
    replaceOptimized,
    goBackOptimized,
    preloadRoute,
    getNavigationTime,
    currentRoute: pathname,
  };
}
