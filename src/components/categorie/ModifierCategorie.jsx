import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const ModifierCategorie = () => {
  const { id } = useParams();
  const [nom_categorie, setNomCategorie] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategorie = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/categories/${id}`);
        setNomCategorie(res.data.nom_categorie);
      } catch (err) {
        console.error('Erreur lors du chargement de la catégorie', err);
      }
    };
    fetchCategorie();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:3000/api/categories/${id}`, { nom_categorie });
      navigate('/admin/liste-categorie');
    } catch (err) {
      console.error('Erreur lors de la modification', err);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Modifier la Catégorie</h2>
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
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Enregistrer les modifications
        </button>
      </form>
    </div>
  );
};

export default ModifierCategorie;
