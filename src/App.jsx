import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import BottomNav from './components/BottomNav.jsx';
import { AuthProvider, useAuth } from './hooks/useAuth.js';
import AI from './pages/AI.jsx';
import Calendar from './pages/Calendar.jsx';
import Cloud from './pages/Cloud.jsx';
import Community from './pages/Community.jsx';
import History from './pages/History.jsx';
import Home from './pages/Home.jsx';
import Log from './pages/Log.jsx';
import Login from './pages/Login.jsx';
import Profile from './pages/Profile.jsx';
import Records from './pages/Records.jsx';

const protectedRoutes = [
  { path: '/', element: <Home /> },
  { path: '/records', element: <Records /> },
  { path: '/log', element: <Log /> },
  { path: '/ai', element: <AI /> },
  { path: '/calendar', element: <Calendar /> },
  { path: '/history', element: <History /> },
  { path: '/profile', element: <Profile /> },
  { path: '/community', element: <Community /> },
  { path: '/cloud', element: <Cloud /> },
];

function LoadingScreen() {
  return (
    <section className="rounded-card border border-paw-border bg-paw-card p-5">
      <p className="text-sm font-medium text-paw-muted">PawCare</p>
      <h1 className="mt-2 font-title text-3xl font-semibold">正在确认登录状态</h1>
    </section>
  );
}

function RequireAuth({ children }) {
  const { loading, session } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;
  if (!session) return <Navigate to="/login" state={{ from: location }} replace />;

  return children;
}

function LoginRoute() {
  const { loading, session } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  if (loading) return <LoadingScreen />;
  if (session) return <Navigate to={from} replace />;

  return <Login />;
}

function AppShell() {
  const location = useLocation();
  const { loading, session } = useAuth();
  const showBottomNav = Boolean(session) && !loading && location.pathname !== '/login';

  return (
    <div className="min-h-screen bg-paw-background font-body text-paw-primary">
      <main className="mx-auto min-h-screen max-w-app px-4 pb-24 pt-6">
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          {protectedRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={<RequireAuth>{route.element}</RequireAuth>}
            />
          ))}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {showBottomNav && <BottomNav />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

export default App;
