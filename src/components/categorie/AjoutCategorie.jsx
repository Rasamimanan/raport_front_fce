import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AjoutCategorie = () => {
  const [nom_categorie, setNomCategorie] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/categories', { nom_categorie });
      navigate('/admin/liste-categorie');
    } catch (err) {
      console.error("Erreur lors de l'ajout", err);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Ajouter une Catégorie</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700">Nom de la catégorie</label>
          <input
            type="text"
            value={nom_categorie}
            onChange={(e) => setNomCategorie(e.target.value)}
            required
            className="w-full border border-gray-300 px-4 py-2 rounded"
          />
        </div>
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Enregistrer
        </button>
      </form>
    </div>
  );
};

export default AjoutCategorie;
