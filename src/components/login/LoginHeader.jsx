import React from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../../assets/logo.png'; // Assurez-vous que le chemin est correct

const LoginHeader = () => {
  return (
    <header className="py-4 px-6 bg-gradient-to-r from-purple-900 via-purple-800 to-purple-700 shadow-xl backdrop-blur-md sticky top-0 z-50">
      <div className="flex justify-between items-center max-w-7xl mx-auto text-white">
        
        {/* Logo + Nom du site */}
        <div className="flex items-center space-x-3 px-5 py-2 bg-purple-700/70 rounded-xl shadow-lg hover:shadow-purple-500/40 transition duration-300">
          <img
            src={logo}
            alt="Logo GestionStockFCE"
            className="h-12 w-12 object-contain drop-shadow-md animate-pulse"
          />
          <span className="text-2xl md:text-3xl font-extrabold tracking-wide bg-gradient-to-r from-orange-400 to-yellow-300 text-transparent bg-clip-text">
            GestionStockFCE
          </span>
        </div>

        {/* Menu */}
        <nav className="flex space-x-3">
          <NavLink
            to="/login"
            className={({ isActive }) =>
              `px-5 py-2 rounded-lg font-semibold transition-all duration-300 transform ${
                isActive
                  ? 'bg-orange-400 text-gray-900 shadow-lg scale-105'
                  : 'hover:bg-purple-600 hover:scale-105 hover:shadow-md'
              }`
            }
          >
            Responsable
          </NavLink>
          <NavLink
            to="/creation-login"
            className={({ isActive }) =>
              `px-5 py-2 rounded-lg font-semibold transition-all duration-300 transform ${
                isActive
                  ? 'bg-orange-400 text-gray-900 shadow-lg scale-105'
                  : 'hover:bg-purple-600 hover:scale-105 hover:shadow-md'
              }`
            }
          >
            Ajouter
          </NavLink>
        </nav>
      </div>
    </header>
  );
};

export default LoginHeader;
