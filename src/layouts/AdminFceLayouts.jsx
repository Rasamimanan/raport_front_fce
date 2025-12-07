import React, { useState, useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import AdminFceHeader from '../components/AdminFceHeader';

const defaultTheme = {
  bgColor: '#f3f4f6',
  textColor: '#111827',
};

const AdminFceLayouts = () => {
  const [bgColor, setBgColor] = useState(() => localStorage.getItem('bgColor') || defaultTheme.bgColor);
  const [textColor, setTextColor] = useState(() => localStorage.getItem('textColor') || defaultTheme.textColor);
  const [showTheme, setShowTheme] = useState(false);
  const themeRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('bgColor', bgColor);
    localStorage.setItem('textColor', textColor);
  }, [bgColor, textColor]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (themeRef.current && !themeRef.current.contains(event.target)) {
        setShowTheme(false);
      }
    };
    if (showTheme) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTheme]);

  return (
    <div
      className="flex flex-col min-h-screen transition-colors duration-700 ease-in-out"
      style={{
        backgroundColor: bgColor,
        color: textColor,
      }}
    >
      {/* Header fixé en haut */}
      <header
        className="fixed top-0 left-0 right-0 w-full py-6 px-8 bg-gray-900 shadow-lg flex items-center justify-center z-50 select-none"
      >
        <h1
          className="text-6xl font-semibold tracking-wide text-orange-300 select-none drop-shadow-lg animate-pulse text-center"
        >
          Gestion de matériel informatique
        </h1>

        <div className="absolute right-8" ref={themeRef}>
          <button
            onClick={() => setShowTheme(prev => !prev)}
            className="bg-gray-800 hover:bg-gray-700 active:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded-lg px-5 py-3 shadow-lg transform transition-transform duration-300 hover:scale-110 flex items-center gap-2"
            aria-label="Ouvrir / Fermer personnalisation thème"
            title="Personnaliser le thème"
          >
            <span className="text-xl">🎨</span>
            <span className="font-semibold text-lg">Thème</span>
          </button>

          {showTheme && (
            <section
              className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl p-6 z-50 text-gray-900 dark:text-gray-100 dark:bg-gray-800 animate-slideDown"
              style={{ color: textColor }}
            >
              <h2 className="text-2xl font-bold mb-6 text-center select-none">
                Personnaliser le thème
              </h2>
              <div className="flex justify-around gap-12">
                <label className="flex flex-col items-center cursor-pointer select-none group">
                  <span className="mb-3 font-medium text-lg group-hover:text-gray-800 transition-colors duration-300">
                    Couleur de fond
                  </span>
                  <input
                    type="color"
                    value={bgColor}
                    onChange={e => setBgColor(e.target.value)}
                    className="w-16 h-16 rounded-full border-4 border-gray-300 shadow-lg transition-transform duration-300 hover:scale-125 cursor-pointer"
                    title="Choisir couleur de fond"
                  />
                </label>

                <label className="flex flex-col items-center cursor-pointer select-none group">
                  <span className="mb-3 font-medium text-lg group-hover:text-gray-800 transition-colors duration-300">
                    Couleur du texte
                  </span>
                  <input
                    type="color"
                    value={textColor}
                    onChange={e => setTextColor(e.target.value)}
                    className="w-16 h-16 rounded-full border-4 border-gray-300 shadow-lg transition-transform duration-300 hover:scale-125 cursor-pointer"
                    title="Choisir couleur du texte"
                  />
                </label>
              </div>
            </section>
          )}
        </div>
      </header>

      {/* Corps principal avec marge pour compenser le header fixé */}
      <div className="flex flex-1 overflow-hidden mt-[110px]">
        <AdminFceHeader />

        <main className="flex-1 p-10 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-purple-200">
          <Outlet />
        </main>
      </div>

      {/* Animations & Scrollbar */}
      <style>{`
        @keyframes fadeIn {
          from {opacity: 0; transform: translateY(-10px);}
          to {opacity: 1; transform: translateY(0);}
        }
        @keyframes slideDown {
          from {opacity: 0; transform: translateY(-15px);}
          to {opacity: 1; transform: translateY(0);}
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.05);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease forwards;
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease forwards;
        }
        .animate-pulse {
          animation: pulse 2s infinite ease-in-out;
        }
        /* Scrollbar styles */
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #d6bcfa; /* purple clair */
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: #6b46c1; /* purple foncé */
          border-radius: 10px;
          border: 2px solid #d6bcfa;
        }
      `}</style>
    </div>
  );
};

export default AdminFceLayouts;
