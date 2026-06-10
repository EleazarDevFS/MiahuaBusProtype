import React from 'react';
import { BottomSheet } from './BottomSheet';
import { Info, MapPin } from 'lucide-react';
import { setLocationPermission } from '../utils/permissions';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void; // called when permission granted
}

export function PermissionModal({ isOpen, onClose, onSuccess }: Props) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Simulate permission flow for prototype: no real geolocation used
  const requestPermission = () => {
    setError(null);
    setLoading(true);

    // Simulate network / user prompt delay
    setTimeout(() => {
      // Simulate successful grant
      setLocationPermission('granted');
      setLoading(false);
      onClose();
      if (onSuccess) onSuccess();
    }, 700);
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-7 h-7 text-[#2E7D32]" />
        </div>
        <h3 className="text-gray-900 mb-2 text-center">Permiso de ubicación</h3>
        <p className="text-sm text-gray-500 text-center mb-4">
          Necesitamos tu ubicación para poder planificar rutas cercanas. Puedes otorgar el permiso ahora.
        </p>

        {error && <p className="text-xs text-[#E53935] mb-3 text-center">{error}</p>}

        <div className="space-y-3">
          <button
            onClick={requestPermission}
            disabled={loading}
            className="w-full py-3.5 bg-[#2E7D32] text-white rounded-xl text-sm"
          >
            {loading ? 'Solicitando permiso...' : 'Dar permiso'}
          </button>

          <button
            onClick={() => {
              // mark as denied if they explicitly close without granting
              setLocationPermission('denied');
              onClose();
            }}
            className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl text-sm"
          >
            No, gracias
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}

export default PermissionModal;
