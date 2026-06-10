import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Search, X, Clock, Trash2 } from 'lucide-react';
import { Header } from '../components/Header';
import { Breadcrumb } from '../components/Breadcrumb';
import { BottomNav } from '../components/BottomNav';
import { motion, AnimatePresence } from 'motion/react';
import { POPULAR_DESTINATIONS } from '../data/routes';

const HISTORY_KEY = 'miahuabus_search_history';
const MAX_HISTORY = 6;

function getHistory(): string[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveToHistory(query: string) {
  const history = getHistory().filter(h => h.toLowerCase() !== query.toLowerCase());
  const updated = [query, ...history].slice(0, MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
}

function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
}

export default function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleSearch = (q?: string) => {
    const term = (q ?? query).trim();
    if (!term) return;
    saveToHistory(term);
    setHistory(getHistory());
    navigate(`/search/results?q=${encodeURIComponent(term)}`);
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
  };

  const handleRemoveHistoryItem = (item: string) => {
    const updated = getHistory().filter(h => h !== item);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    setHistory(updated);
  };

  return (
    <div className="min-h-screen w-full bg-white pb-20">
      <Header title="Buscar ruta" />
      <Breadcrumb items={[
        { label: 'Inicio', path: '/home' },
        { label: 'Buscar', path: '/search' }
      ]} />

      <div className="pt-[104px] px-4 py-4">
        {/* Campo de búsqueda */}
        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="¿A dónde quieres ir?"
            autoFocus
            className="w-full pl-11 pr-12 py-3 bg-[#F5F5F5] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent text-sm"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>

        {query.trim() && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => handleSearch()}
            className="w-full py-3 mb-5 bg-[#2E7D32] text-white rounded-xl text-sm"
          >
            Buscar "{query}"
          </motion.button>
        )}

        {/* Historial de búsqueda */}
        <AnimatePresence>
          {history.length > 0 && !query && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-5"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm text-gray-700">Búsquedas recientes</h3>
                <button
                  onClick={handleClearHistory}
                  className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  Borrar
                </button>
              </div>
              <div className="space-y-1.5">
                {history.map((item) => (
                  <motion.div
                    key={item}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-3 group"
                  >
                    <button
                      onClick={() => handleSearch(item)}
                      className="flex-1 flex items-center gap-3 p-3 bg-[#F5F5F5] rounded-xl hover:bg-green-50 hover:border-[#2E7D32] border border-transparent transition-all text-left"
                    >
                      <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-800">{item}</span>
                    </button>
                    <button
                      onClick={() => handleRemoveHistoryItem(item)}
                      className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Destinos populares */}
        <div>
          <h3 className="text-sm text-gray-700 mb-3">Destinos populares</h3>
          <div className="space-y-2">
            {POPULAR_DESTINATIONS.map((destination) => (
              <motion.button
                key={destination.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSearch(destination.name)}
                className="w-full flex items-center gap-3 p-3.5 bg-[#F5F5F5] rounded-xl hover:bg-green-50 hover:border-[#2E7D32] border border-transparent transition-all"
              >
                <span className="text-xl">{destination.icon}</span>
                <span className="text-sm text-gray-900">{destination.name}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
