import { lazy, Suspense } from 'react';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

const Register = lazy(() => import('./pages/Register'));
const Login = lazy(() => import('./pages/Login'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Listings = lazy(() => import('./pages/Listings'));
const PropertyDetails = lazy(() => import('./pages/PropertyDetails'));
const PropertyForm = lazy(() => import('./pages/PropertyForm'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AiHub = lazy(() => import('./pages/AiHub'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

function Navigation() {
  const { user, logout } = useAuth();
  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-brand-700">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-600 text-sm text-white">H</span>
          <span>Homeora</span>
        </Link>
        <div className="flex flex-wrap gap-4 text-sm font-medium">
          <Link to="/properties">Properties</Link>
          {import.meta.env.VITE_ENABLE_AI_HUB === 'true' && <Link to="/ai-hub">AI Hub</Link>}
          {user ? (
            <>
              <Link to="/properties/new">Add Property</Link>
              <Link to="/dashboard">Dashboard</Link>
              {user.role === 'admin' && <Link to="/admin">Admin</Link>}
              <button onClick={logout} className="text-red-700">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navigation />
        <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
          <Routes>
            <Route path="/" element={<Listings />} />
            <Route path="/properties" element={<Listings />} />
            <Route path="/properties/new" element={<ProtectedRoute><PropertyForm /></ProtectedRoute>} />
            <Route path="/properties/:id/edit" element={<ProtectedRoute><PropertyForm /></ProtectedRoute>} />
            <Route path="/properties/:id" element={<PropertyDetails />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
            {import.meta.env.VITE_ENABLE_AI_HUB === 'true' && (
              <Route path="/ai-hub" element={<AiHub />} />
            )}
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
