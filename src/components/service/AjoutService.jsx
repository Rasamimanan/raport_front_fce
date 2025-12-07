import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AjoutService = () => {
  const [nom, setNom] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Validation simple
      if (!nom.trim()) {
        throw new Error('Le nom du service est requis');
      }

      const response = await axios.post('http://localhost:3000/api/services', {
        nom_service: nom // Correspond à l'attendu par votre modèle
      });

      if (response.status === 201) {
        navigate('/admin/liste-service');
      } else {
        throw new Error(`Réponse inattendue: ${response.status}`);
      }
    } catch (err) {
      console.error("Erreur lors de l'ajout", err);
      setError(err.response?.data?.message || err.message || "Une erreur est survenue lors de l'ajout du service");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Ajouter un Service</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-1">Nom du service*</label>
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/admin/liste-service')}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:bg-gray-300"
            disabled={loading}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-green-300"
            disabled={loading}
          >
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AjoutService;