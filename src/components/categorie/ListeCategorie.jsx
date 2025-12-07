import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ListeCategorie = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('nom_categorie');

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:3000/api/categories');
      setCategories(res.data);
      setError(null);
    } catch {
      setError('Erreur lors du chargement des catégories');
    } finally {
      setLoading(false);
    }
  };

  const supprimerCategorie = async (id) => {
    if (window.confirm('Supprimer cette catégorie ?')) {
      try {
        await axios.delete(`http://localhost:3000/api/categories/${id}`);
        setCategories(prev => prev.filter(cat => cat.id_categorie !== id));
      } catch {
        setError('Erreur lors de la suppression');
      }
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter((cat) =>
    cat[searchField]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading)
    return (
      <div className="max-w-5xl mx-auto p-6 bg-white shadow rounded-xl text-center text-gray-700">
        Chargement en cours...
      </div>
    );

  if (error)
    return (
      <div className="max-w-5xl mx-auto p-6 bg-white shadow rounded-xl text-center">
        <p className="text-red-600 font-semibold">{error}</p>
        <button
          onClick={fetchCategories}
          className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded transition"
        >
          Réessayer
        </button>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow rounded-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Liste des catégories</h2>
        <Link
          to="/admin/ajout-categorie"
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
        >
          + Nouvelle catégorie
        </Link>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <select
          value={searchField}
          onChange={(e) => setSearchField(e.target.value)}
          className="border px-3 py-2 rounded-md"
        >
          <option value="nom_categorie">Nom</option>
          <option value="id_categorie">ID</option>
        </select>
        <input
          type="text"
          placeholder={`Recherche par ${searchField === 'nom_categorie' ? 'nom' : 'ID'}`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-4 py-2 rounded-md w-full"
        />
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-green-600 text-white">
            <th className="p-3 text-left">ID</th>
            <th className="p-3 text-left">Nom</th>
            <th className="p-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredCategories.length === 0 ? (
            <tr>
              <td colSpan="3" className="text-center p-6 text-gray-500">
                Aucune catégorie trouvée.
              </td>
            </tr>
          ) : (
            filteredCategories.map((cat) => (
              <tr key={cat.id_categorie} className="border-b hover:bg-gray-50 transition">
                <td className="p-3">{cat.id_categorie}</td>
                <td className="p-3">{cat.nom_categorie}</td>
                <td className="p-3 flex justify-center gap-4">
                  <Link
                    to={`/admin/modifier-categorie/${cat.id_categorie}`}
                    className="text-blue-600 hover:underline"
                  >
                    Modifier
                  </Link>
                  <button
                    onClick={() => supprimerCategorie(cat.id_categorie)}
                    className="text-red-500 hover:underline"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ListeCategorie;
