import { useState, useEffect, useCallback } from 'react';

export interface RouteParams {
  [key: string]: string;
}

export interface Route {
  path: string;
  params: RouteParams;
}

function parseHash(): Route {
  const hash = window.location.hash.slice(1) || '/';
  const [pathWithQuery] = hash.split('?');
  const [path, ...paramParts] = pathWithQuery.split('/').filter(Boolean);
  
  const params: RouteParams = {};
  
  // Parse path parameters (e.g., /product/123 -> { id: '123' })
  if (paramParts.length > 0) {
    params.id = paramParts[0];
  }
  
  // Parse query parameters
  const queryString = hash.split('?')[1];
  if (queryString) {
    const searchParams = new URLSearchParams(queryString);
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
  }
  
  return {
    path: path ? `/${path}` : '/',
    params
  };
}

export function useRouter() {
  const [currentRoute, setCurrentRoute] = useState<Route>(parseHash());

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentRoute(parseHash());
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = useCallback((path: string, params?: RouteParams) => {
    let hash = `#${path}`;
    if (params) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        queryParams.append(key, value);
      });
      const queryString = queryParams.toString();
      if (queryString) {
        hash += `?${queryString}`;
      }
    }
    window.location.hash = hash;
  }, []);

  return { currentRoute, navigate };
}
