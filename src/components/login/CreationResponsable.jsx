import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreationResponsable = () => {
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [confirm, setConfirm] = useState('');
  const [afficher, setAfficher] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (motDePasse !== confirm) {
      setMessage("❌ Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      await axios.post('http://localhost:3000/api/responsables', {
        nom_responsable: nom,
        email,
        mot_de_passe: motDePasse,
      });
      setMessage("✅ Responsable créé avec succès !");
      setNom('');
      setEmail('');
      setMotDePasse('');
      setConfirm('');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setMessage("❌ Erreur : " + error.response?.data?.error || error.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
      <form onSubmit={handleSubmit} className="bg-white text-black p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">création compte</h2>

        {message && <div className="mb-4 text-sm text-center text-red-600">{message}</div>}

        <div className="mb-4">
          <label className="block mb-1">Nom complet</label>
          <input type="text" className="w-full border px-3 py-2 rounded" value={nom} onChange={(e) => setNom(e.target.value)} required />
        </div>

        <div className="mb-4">
          <label className="block mb-1">Adresse email</label>
          <input type="email" className="w-full border px-3 py-2 rounded" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div className="mb-4">
          <label className="block mb-1">Mot de passe</label>
          <input type={afficher ? "text" : "password"} className="w-full border px-3 py-2 rounded" value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} required />
        </div>

        <div className="mb-4">
          <label className="block mb-1">Confirmer le mot de passe</label>
          <input type={afficher ? "text" : "password"} className="w-full border px-3 py-2 rounded" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
        </div>

        <div className="mb-6 flex items-center space-x-2">
          <input type="checkbox" id="afficher" checked={afficher} onChange={() => setAfficher(!afficher)} />
          <label htmlFor="afficher" className="text-sm">Afficher les mots de passe</label>
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
          Créer le compte
        </button>
      </form>
    </div>
  );
};

export default CreationResponsable;
