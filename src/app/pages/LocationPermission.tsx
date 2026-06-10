import React from 'react';
import { useNavigate } from 'react-router';
import { MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import PermissionModal from '../components/PermissionModal';
import { setLocationPermission } from '../utils/permissions';

export default function LocationPermission() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = React.useState(false);

  const handleAllow = () => {
    // Simulate granting permission (prototype)
    setLocationPermission('granted');
    navigate('/home');
  };

  const handleSkip = () => {
    // show a message explaining why permission is needed and allow to grant now
    setShowModal(true);
  };

  return (
    <div className="h-screen w-full bg-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="w-48 h-48 bg-gradient-to-br from-green-100 to-green-50 rounded-full flex items-center justify-center">
            <MapPin className="w-24 h-24 text-[#2E7D32]" strokeWidth={1.5} />
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mb-12"
        >
          <h1 className="text-gray-900 mb-3">Permiso de ubicación</h1>
          <p className="text-gray-600">Para mostrarte las rutas más cercanas a ti</p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="w-full space-y-3"
        >
          <button
            onClick={handleAllow}
            className="w-full bg-[#2E7D32] text-white py-4 px-6 rounded-xl hover:bg-[#1B5E20] transition-colors shadow-lg"
          >
            Permitir
          </button>

          <button onClick={handleSkip} className="w-full text-gray-600 py-3 hover:text-[#2E7D32] transition-colors">
            Ahora no
          </button>
        </motion.div>
      </div>

      <PermissionModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          navigate('/home');
        }}
        onSuccess={() => {
          setShowModal(false);
          navigate('/home');
        }}
      />
    </div>
  );
}
