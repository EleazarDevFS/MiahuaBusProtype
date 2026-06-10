import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { User, Heart, Bell, Info, LogOut, ChevronRight } from 'lucide-react';
import { Header } from '../components/Header';
import { Breadcrumb } from '../components/Breadcrumb';
import { BottomNav } from '../components/BottomNav';
import { BottomSheet } from '../components/BottomSheet';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { favorites } = useFavorites();
  const [showLogoutSheet, setShowLogoutSheet] = useState(false);

  const handleLogout = () => {
    logout();
    setShowLogoutSheet(false);
    navigate('/welcome');
  };

  const menuItems = [
    {
      icon: Heart,
      iconBg: 'bg-green-50',
      iconColor: 'text-[#2E7D32]',
      label: 'Mis favoritos',
      subtitle: `${favorites.length} ${favorites.length === 1 ? 'ruta guardada' : 'rutas guardadas'}`,
      action: () => navigate('/favorites'),
    },
    {
      icon: Bell,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      label: 'Notificaciones',
      subtitle: 'Configura tus alertas de salida',
      action: () => navigate('/notifications'),
    },
    {
      icon: Info,
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
      label: 'Acerca de MiahuaBus',
      subtitle: 'Versión 1.0.0',
      action: () => navigate('/about'),
    },
  ];

  return (
    <div className="min-h-screen w-full bg-[#F8F9FA] pb-20">
      <Header title="Perfil" showBack={false} />
      <Breadcrumb items={[
        { label: 'Inicio', path: '/home' },
        { label: 'Perfil', path: '/profile' }
      ]} />

      <div className="pt-[104px] px-4 py-4">
        {/* Tarjeta de usuario */}
        <div className="bg-gradient-to-br from-[#2E7D32] to-[#1B5E20] rounded-2xl p-5 mb-5 shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-white text-base truncate">{user?.name}</h2>
              <p className="text-green-200 text-xs truncate">{user?.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 bg-white/20 text-white text-[10px] rounded-full">
                {user?.provider === 'google' ? '🔵 Google' : '✉️ Correo'}
              </span>
            </div>
          </div>
        </div>

        {/* Menú de opciones */}
        <div className="space-y-2 mb-5">
          {menuItems.map(({ icon: Icon, iconBg, iconColor, label, subtitle, action }) => (
            <motion.button
              key={label}
              whileTap={{ scale: 0.98 }}
              onClick={action}
              className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-[#2E7D32] transition-colors shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
                <div className="text-left">
                  <p className="text-sm text-gray-900">{label}</p>
                  <p className="text-xs text-gray-500">{subtitle}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </motion.button>
          ))}
        </div>

        {/* Cerrar sesión */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowLogoutSheet(true)}
          className="w-full flex items-center justify-center gap-2 p-4 bg-white border-2 border-[#E53935] text-[#E53935] rounded-xl hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm">Cerrar sesión</span>
        </motion.button>
      </div>

      {/* Confirmación logout */}
      <BottomSheet isOpen={showLogoutSheet} onClose={() => setShowLogoutSheet(false)}>
        <div className="p-6">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogOut className="w-7 h-7 text-[#E53935]" />
          </div>
          <h3 className="text-gray-900 mb-2 text-center">¿Cerrar sesión?</h3>
          <p className="text-sm text-gray-500 text-center mb-6">
            Tendrás que iniciar sesión nuevamente para acceder
          </p>
          <div className="space-y-3">
            <button
              onClick={handleLogout}
              className="w-full py-4 bg-[#E53935] text-white rounded-xl hover:bg-[#C62828] transition-colors text-sm"
            >
              Sí, cerrar sesión
            </button>
            <button
              onClick={() => setShowLogoutSheet(false)}
              className="w-full py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      </BottomSheet>

      <BottomNav />
    </div>
  );
}
