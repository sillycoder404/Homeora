import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <main className="p-8 text-center">Loading account...</main>;
  return user ? children : <Navigate to="/login" replace />;
}
