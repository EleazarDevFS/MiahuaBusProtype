import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Bus } from 'lucide-react';
import { motion } from 'motion/react';

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/welcome');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="h-screen w-full bg-[#2E7D32] flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        <div className="bg-white rounded-full p-6 mb-4">
          <Bus className="w-16 h-16 text-[#2E7D32]" />
        </div>
        <h1 className="text-white text-2xl">MiahuaBus</h1>
      </motion.div>
    </div>
  );
}
