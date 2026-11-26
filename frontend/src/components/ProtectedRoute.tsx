import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function ProtectedRoute({ children, requireAdmin = false }: { children: ReactNode; requireAdmin?: boolean }) {
  const { user, loading } = useAuth();
  if (loading) return <main className="p-8 text-center">Loading account...</main>;
  if (requireAdmin && user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return user ? children : <Navigate to="/login" replace />;
}
