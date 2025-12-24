import { Navigate } from 'react-router-dom';
import { useSession } from '../state/session';

export function HomeRedirect() {
  const { accessToken } = useSession();
  return <Navigate to={accessToken ? '/dashboard' : '/login'} replace />;
}
