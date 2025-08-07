import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ user, children }) {
  if (!user) return <Navigate to="/" replace />; // Redirect to public Home if not logged in
  return children;
}
