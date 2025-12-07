import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const ModifierService = () => {
  const [nom, setNom] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:3000/api/services/${id}`);
        setNom(res.data.nom_service);
        setError(null);
      } catch (err) {
        console.error('Erreur chargement service', err);
        setError('Erreur lors du chargement du service');
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (!nom.trim()) {
        throw new Error('Le nom du service est requis');
      }

      await axios.put(`http://localhost:3000/api/services/${id}`, { 
        nom_service: nom 
      });
      navigate('/admin/liste-service');
    } catch (err) {
      console.error('Erreur modification', err);
      setError(err.response?.data?.message || err.message || 'Erreur lors de la modification du service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Modifier le Service</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700">Nom du service</label>
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            required
            className="w-full border px-4 py-2 rounded"
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
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
            disabled={loading}
          >
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ModifierService;