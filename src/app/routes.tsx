import { createBrowserRouter, Navigate } from 'react-router';
import Splash from './pages/Splash';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Register from './pages/Register';
import LocationPermission from './pages/LocationPermission';
import Home from './pages/Home';
import SearchPage from './pages/SearchPage';
import SearchResults from './pages/SearchResults';
import RouteDetail from './pages/RouteDetail';
import Routes from './pages/Routes';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import Planner from './pages/Planner';
import Notifications from './pages/Notifications';
import About from './pages/About';
import { useAuth } from './context/AuthContext';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#2E7D32] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/welcome" replace />;
  }

  return <>{children}</>;
}

const protected_ = (el: React.ReactNode) => (
  <ProtectedRoute>{el}</ProtectedRoute>
);

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/splash" replace /> },
  { path: '/splash', element: <Splash /> },
  { path: '/welcome', element: <Welcome /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/location-permission', element: protected_(<LocationPermission />) },
  { path: '/home', element: protected_(<Home />) },
  { path: '/search', element: protected_(<SearchPage />) },
  { path: '/search/results', element: protected_(<SearchResults />) },
  { path: '/route/:id', element: protected_(<RouteDetail />) },
  { path: '/routes', element: protected_(<Routes />) },
  { path: '/favorites', element: protected_(<Favorites />) },
  { path: '/profile', element: protected_(<Profile />) },
  { path: '/planner', element: protected_(<Planner />) },
  { path: '/notifications', element: protected_(<Notifications />) },
  { path: '/about', element: protected_(<About />) },
  { path: '*', element: <Navigate to="/splash" replace /> }
]);
