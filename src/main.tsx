// import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { QueryProvider, queryClient } from './contexts/QueryClientProvider';
import { AuthProvider } from './contexts/AuthContext';
import { UsageLimitsProvider } from './contexts/UsageLimitsContext';
import { TooltipProvider } from '@/components/shadui/tooltip';
import './index.css';
import 'katex/dist/katex.min.css';

// Import the generated route tree
import { routeTree } from './routeTree.gen';

// Create the router instance
const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  <QueryProvider>
    <AuthProvider>
      <UsageLimitsProvider>
        <TooltipProvider>
          <RouterProvider router={router} />
        </TooltipProvider>
      </UsageLimitsProvider>
    </AuthProvider>
  </QueryProvider>
);
