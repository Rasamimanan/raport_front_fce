import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { FaUser, FaEnvelope, FaLock, FaTimes } from 'react-icons/fa';

const AdminProfil = () => {
  const [responsable, setResponsable] = useState({
    id_responsable: '',
    nom_responsable: '',
    email: '',
    mot_de_passe: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isOpen, setIsOpen] = useState(true); // Pour afficher ou fermer la carte

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('responsable'));
    if (data)
      setResponsable({
        id_responsable: data.id_responsable || '',
        nom_responsable: data.nom_responsable || '',
        email: data.email || '',
        mot_de_passe: '',
      });
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://localhost:3000/api/responsables/${responsable.id_responsable}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nom_responsable: responsable.nom_responsable,
            email: responsable.email,
            mot_de_passe: responsable.mot_de_passe,
          }),
        }
      );

      if (!response.ok) throw new Error('Erreur lors de la mise à jour du profil');

      const updatedResponsable = await response.json();
      localStorage.setItem('responsable', JSON.stringify(updatedResponsable));

      Swal.fire({
        icon: 'success',
        title: 'Profil mis à jour',
        text: 'Vos informations ont été sauvegardées avec succès.',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Impossible de mettre à jour le profil. Veuillez réessayer.',
      });
    }
  };

  if (!isOpen) return null; // Si fermé, rien n'est affiché

  return (
    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 w-96 bg-white shadow-2xl rounded-2xl p-6 z-50 flex flex-col gap-5 animate-fadeIn">
      
      {/* Bouton fermeture */}
      <button
        onClick={() => setIsOpen(false)}
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition"
      >
        <FaTimes />
      </button>

      {/* Avatar et titre */}
      <div className="flex flex-col items-center mb-4">
        <div className="w-20 h-20 bg-purple-600 text-white rounded-full flex items-center justify-center text-3xl font-bold shadow-lg">
          {responsable.nom_responsable.charAt(0).toUpperCase()}
        </div>
        <h2 className="text-xl font-bold mt-2 text-gray-800">Mon Profil</h2>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleUpdate} className="flex flex-col gap-4">
        
        {/* Nom */}
        <div className="flex items-center gap-2 border-b border-gray-300 focus-within:border-purple-600 transition">
          <FaUser className="text-gray-400" />
          <input
            type="text"
            value={responsable.nom_responsable}
            onChange={(e) =>
              setResponsable({ ...responsable, nom_responsable: e.target.value })
            }
            placeholder="Nom"
            className="w-full py-2 outline-none placeholder-gray-400"
          />
        </div>

        {/* Email */}
        <div className="flex items-center gap-2 border-b border-gray-300 focus-within:border-purple-600 transition">
          <FaEnvelope className="text-gray-400" />
          <input
            type="email"
            value={responsable.email}
            onChange={(e) =>
              setResponsable({ ...responsable, email: e.target.value })
            }
            placeholder="Email"
            className="w-full py-2 outline-none placeholder-gray-400"
          />
        </div>

        {/* Mot de passe */}
        <div className="flex items-center gap-2 border-b border-gray-300 focus-within:border-purple-600 transition relative">
          <FaLock className="text-gray-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={responsable.mot_de_passe}
            onChange={(e) =>
              setResponsable({ ...responsable, mot_de_passe: e.target.value })
            }
            placeholder="Mot de passe"
            className="w-full py-2 outline-none placeholder-gray-400 pr-16"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-sm text-purple-600 font-semibold px-3 py-1 hover:text-purple-800 transition"
          >
            {showPassword ? 'Masquer' : 'Afficher'}
          </button>
        </div>

        <button
          type="submit"
          className="mt-4 w-full bg-purple-600 text-white font-semibold py-2 rounded-lg hover:bg-purple-700 transition"
        >
          Sauvegarder
        </button>
      </form>
    </div>
  );
};

export default AdminProfil;
