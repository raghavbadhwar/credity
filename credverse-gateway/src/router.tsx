import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Shell, AuthGuard } from './components/Layout';
import {
  LoginPage,
  VerifyPage,
  DashboardPage,
  CredentialsPage,
  ConnectionsPage,
  ProfilePage,
  NotFoundPage,
  LegacyPage,
  HomeRedirect,
} from './pages';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomeRedirect />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/legacy',
    element: <LegacyPage />,
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        <Shell />
      </AuthGuard>
    ),
    children: [
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'verify',
        element: <VerifyPage />,
      },
      {
        path: 'credentials',
        element: <CredentialsPage />,
      },
      {
        path: 'connections',
        element: <ConnectionsPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
    ],
  },
  {
    path: '/404',
    element: <NotFoundPage />,
  },
  {
    path: '*',
    element: <Navigate to="/404" replace />,
  },
]);
