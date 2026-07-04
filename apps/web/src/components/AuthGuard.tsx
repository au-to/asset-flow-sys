import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Role } from '@asset-flow/shared';
import { useAuthStore } from '../stores/authStore';

interface AuthGuardProps {
  roles?: Role[];
  children: ReactNode;
}

export default function AuthGuard({ roles, children }: AuthGuardProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
}
