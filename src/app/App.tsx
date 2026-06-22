import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { UserRoutesProvider } from './context/UserRoutesContext';

export default function App() {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <UserRoutesProvider>
          <div className="size-full max-w-[430px] mx-auto bg-white min-h-screen">
            <RouterProvider router={router} />
          </div>
        </UserRoutesProvider>
      </FavoritesProvider>
    </AuthProvider>
  );
}