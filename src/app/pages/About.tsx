import React from 'react';
import { Bus, MapPin, Clock, Heart, Shield, Mail, ExternalLink } from 'lucide-react';
import { Header } from '../components/Header';
import { Breadcrumb } from '../components/Breadcrumb';
import { BottomNav } from '../components/BottomNav';
import { motion } from 'motion/react';

const FEATURES = [
  { icon: MapPin, label: 'Rutas locales', desc: '6 rutas de microbús en Miahuatlán' },
  { icon: Clock, label: 'Horarios estáticos', desc: 'Consulta salidas de todo el día' },
  { icon: Heart, label: 'Favoritos', desc: 'Guarda tus rutas más usadas' },
  { icon: Shield, label: 'Sin publicidad', desc: 'Diseñada para la comunidad' },
];

export default function About() {
  return (
    <div className="min-h-screen w-full bg-[#F8F9FA] pb-20">
      <Header title="Acerca de MiahuaBus" />
      <Breadcrumb items={[
        { label: 'Inicio', path: '/home' },
        { label: 'Perfil', path: '/profile' },
        { label: 'Acerca de', path: '/about' }
      ]} />

      <div className="pt-[104px]">
        {/* Hero */}
        <div className="bg-[#2E7D32] px-4 py-8 text-center">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Bus className="w-10 h-10 text-[#2E7D32]" />
          </div>
          <h1 className="text-white text-xl mb-1">MiahuaBus</h1>
          <p className="text-green-200 text-sm">Versión 1.0.0</p>
          <p className="text-green-100 text-xs mt-2">
            Miahuatlán de Porfirio Díaz, Oaxaca
          </p>
        </div>

        <div className="px-4 py-5">
          {/* Descripción */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm">
            <h2 className="text-sm text-gray-900 mb-2">¿Qué es MiahuaBus?</h2>
            <p className="text-xs text-gray-600 leading-relaxed">
              MiahuaBus es una aplicación de consulta de horarios y rutas de microbuses para Miahuatlán de Porfirio Díaz, Oaxaca. Diseñada para reducir la incertidumbre al viajar en transporte público local, sin GPS ni sensores, solo información clara y accesible.
            </p>
          </div>

          {/* Funciones */}
          <h2 className="text-sm text-gray-700 mb-3">Características</h2>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {FEATURES.map(({ icon: Icon, label, desc }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm"
              >
                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center mb-2">
                  <Icon className="w-4 h-4 text-[#2E7D32]" />
                </div>
                <p className="text-xs text-gray-900 mb-0.5">{label}</p>
                <p className="text-[10px] text-gray-500 leading-tight">{desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Rutas disponibles */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm">
            <h2 className="text-sm text-gray-900 mb-3">Rutas cubiertas</h2>
            <div className="space-y-2">
              {[
                { name: 'Ruta UNSIS', color: '#2E7D32' },
                { name: 'Ruta Centro-Hospital', color: '#1976D2' },
                { name: 'Ruta Cefereso', color: '#F57C00' },
                { name: 'Ruta Reclusorio', color: '#7B1FA2' },
                { name: 'Ruta San Sebastián', color: '#D32F2F' },
                { name: 'Ruta Moctezuma', color: '#00796B' },
              ].map((r) => (
                <div key={r.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
                  <span className="text-xs text-gray-700">{r.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contacto */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h2 className="text-sm text-gray-900 mb-3">Contacto y soporte</h2>
            <a
              href="mailto:soporte@miahuabus.mx"
              className="flex items-center gap-3 p-3 bg-[#F5F5F5] rounded-lg hover:bg-green-50 transition-colors"
            >
              <Mail className="w-4 h-4 text-[#2E7D32]" />
              <span className="text-sm text-gray-700">soporte@miahuabus.mx</span>
              <ExternalLink className="w-3.5 h-3.5 text-gray-400 ml-auto" />
            </a>
            <p className="text-[10px] text-gray-400 mt-3 text-center">
              Los horarios son aproximados y pueden cambiar. Esta app no tiene afiliación oficial con las líneas de microbús.
            </p>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
