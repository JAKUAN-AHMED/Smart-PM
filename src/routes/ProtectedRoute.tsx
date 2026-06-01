import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import type { Role } from '@/types';

interface Props {
  roles?: Role[];
}

export default function ProtectedRoute({ roles }: Props) {
  const location = useLocation();
  const { user, token } = useAppSelector((s) => s.auth);

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}
