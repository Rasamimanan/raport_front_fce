import React, { useState, memo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
  LogOut,
  BarChart2,
  Users,
  Package,
  Truck,
  Layers,
  Archive,
  Building,
} from 'lucide-react';
import defaultAvatar from '../assets/icon_01.png';
import logo from '../assets/logo.png';

const AdminFceHeader = memo(() => {
  const navigate = useNavigate();
  const responsable = JSON.parse(localStorage.getItem('responsable') || '{}');
  const [collapsed, setCollapsed] = useState(true); // Sidebar collapsed par défaut

  const handleLogout = () => {
    Swal.fire({
      title: 'Se déconnecter ?',
      text: 'Êtes-vous sûr de vouloir vous déconnecter ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444', // Tailwind red-500
      cancelButtonColor: '#06b6d4', // Tailwind cyan-500
      confirmButtonText: 'Oui, déconnecter',
      cancelButtonText: 'Annuler',
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('token');
        localStorage.removeItem('responsable');
        Swal.fire({
          title: 'Déconnecté !',
          text: 'Vous avez été déconnecté avec succès.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          navigate('/login');
        });
      }
    });
  };

  return (
    <div
      className={`
        fixed top-0 left-0 min-h-screen bg-gradient-to-br from-[#0F0C2A] to-[#1E1A4D] text-white flex flex-col shadow-[0_4px_20px_rgba(0,0,0,0.3)] z-50
        transition-all duration-500 ease-in-out
        ${collapsed ? 'w-20' : 'w-72'}
      `}
      onMouseEnter={() => setCollapsed(false)}
      onMouseLeave={() => setCollapsed(true)}
      aria-expanded={!collapsed}
    >
      {/* Logo & Title */}
      <div className="p-5 border-b border-gray-700/20 flex items-center justify-start space-x-4">
        <img
          src={logo}
          alt="FCE Stock Logo"
          className="w-12 h-12 object-contain rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]"
          loading="lazy"
        />
        {!collapsed && (
          <span className="text-2xl font-extrabold tracking-tight text-cyan-400 select-none">
            FCE Stock
          </span>
        )}
      </div>

      {/* User Profile */}
      <div
        className="p-5 flex items-center space-x-4 border-b border-gray-700/20 cursor-pointer hover:bg-violet-900/30 transition-all duration-300"
        onClick={() => navigate('/admin/profil')}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && navigate('/admin/profil')}
        aria-label="View profile"
      >
        <img
          src={defaultAvatar}
          alt={`${responsable?.nom_responsable || 'Utilisateur'} avatar`}
          className="w-12 h-12 rounded-full border-2 border-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.4)] object-cover transition-transform duration-300 hover:scale-110"
          loading="lazy"
        />
        {!collapsed && (
          <div className="flex-1 text-sm font-semibold text-gray-100 truncate">
            {responsable?.nom_responsable && responsable?.prenom_responsable
              ? `${responsable.nom_responsable} ${responsable.prenom_responsable}`
              : responsable?.email || 'Utilisateur'}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500 scrollbar-track-[#0F0C2A]">
        {[
          { to: '/admin/dashboard', icon: <BarChart2 size={24} />, label: 'Statistiques' },
          { to: '/admin/liste-affectation', icon: <Layers size={24} />, label: 'Affectations' },
          { to: '/admin/liste-categorie', icon: <Archive size={24} />, label: 'Catégories' },
          { to: '/admin/liste-employee', icon: <Users size={24} />, label: 'Employés' },
          { to: '/admin/liste-materiel', icon: <Package size={24} />, label: 'Matériels' },
          { to: '/admin/liste-mouvement', icon: <Truck size={24} />, label: 'Mouvements' },
          { to: '/admin/liste-service', icon: <Building size={24} />, label: 'Services' },
        ].map(({ to, icon, label }, idx) => (
          <NavLink
            key={idx}
            to={to}
            className={({ isActive }) =>
              `flex items-center space-x-4 px-4 py-3 rounded-2xl transition-all duration-300 ${
                isActive
                  ? 'bg-violet-800 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                  : 'text-gray-200 hover:bg-violet-900/40 hover:text-cyan-300'
              }`
            }
            title={collapsed ? label : undefined}
            aria-label={label}
          >
            {icon}
            {!collapsed && <span className="text-base font-semibold tracking-wide">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-700/20">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center space-x-3 w-full bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-2xl transition-all duration-300 shadow-[0_0_10px_rgba(239,68,68,0.3)] hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]"
          title={collapsed ? 'Déconnexion' : undefined}
          aria-label="Log out"
        >
          <LogOut size={24} />
          {!collapsed && <span className="text-base font-semibold">Déconnexion</span>}
        </button>
      </div>
    </div>
  );
});

export default AdminFceHeader;