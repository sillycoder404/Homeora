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
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

function Navigation() {
  const { user, logout } = useAuth();
  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link to="/" className="text-xl font-bold text-brand-700">RealEstate India</Link>
        <div className="flex flex-wrap gap-4 text-sm font-medium">
          <Link to="/properties">Properties</Link>
          {import.meta.env.VITE_ENABLE_AI_HUB === 'true' && <Link to="/ai-hub">AI Hub</Link>}
          {user ? (
            <>
              <Link to="/properties/new">Add Property</Link>
              <Link to="/dashboard">Dashboard</Link>
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
