import { createBrowserRouter, Navigate } from 'react-router-dom';

// Import root layout
import App from '@/App.tsx';

// Import pages
import MainApp from '@/pages/MainApp.tsx';
import LandingPage from '@/pages/landingpage/LandingPage.tsx';
import NotFoundPage from '@/pages/NotFoundPage.tsx';
import SignUp from '@/pages/auth/SignUp';
import SignIn from '@/pages/auth/SignIn';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';
import ValidateCode from '@/pages/auth/ValidateCode';

import Checkout from '@/pages/checkout/Checkout';
import AccountSettings from '@/pages/user/AccountSettings';
import AppPricing from '@/pages/pricing/AppPricing';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { GuestGuard } from '@/components/auth/GuestGuard';

// Default development start page
const DEV_START_PAGE = '/landing';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <Navigate to={DEV_START_PAGE} replace />,
      },
      {
        path: 'landing',
        element: <LandingPage />,
      },
      {
        element: <GuestGuard />,
        children: [
          {
            path: 'signup',
            element: <SignUp />,
          },
          {
            path: 'signin',
            element: <SignIn />,
          },
          {
            path: 'forgot-password',
            element: <ForgotPassword />,
          },
          {
            path: 'validate-code',
            element: <ValidateCode />,
          },
          {
            path: 'reset-password',
            element: <ResetPassword />,
          },
        ],
      },
      {
        element: <AuthGuard />,
        children: [
          {
            path: 'pricing',
            element: <AppPricing />,
          },
          {
            path: 'checkout',
            element: <Checkout />,
          },
          {
            path: 'app',
            element: <MainApp />,
          },

          {
            path: 'app/settings',
            element: <AccountSettings />,
          },
        ],
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);

export default router;
