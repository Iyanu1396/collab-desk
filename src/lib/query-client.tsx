"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 10, // 10 minutes (renamed from cacheTime)
            refetchOnWindowFocus: false,
            refetchOnMount: true, // Allow refetch on mount for better UX
            retry: (failureCount, error: any) => {
              if (error?.status === 404) return false;
              if (error?.status >= 500) return failureCount < 2;
              if (failureCount < 3) return true;
              return false;
            },
          },
          mutations: {
            retry: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
