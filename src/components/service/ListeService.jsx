import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ListeService = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState('nom');
  const navigate = useNavigate();

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:3000/api/services');
      setServices(res.data);
      setError(null);
    } catch {
      setError('Erreur lors du chargement des services');
    } finally {
      setLoading(false);
    }
  };

  const supprimerService = async (id) => {
    if (window.confirm('Supprimer ce service ?')) {
      try {
        await axios.delete(`http://localhost:3000/api/services/${id}`);
        fetchServices();
      } catch {
        setError('Erreur lors de la suppression du service');
      }
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const filteredServices = services.filter(service => {
    const term = searchTerm.toLowerCase();
    if (searchBy === 'id') {
      return service.id_service.toString().includes(term);
    } else {
      return service.nom_service.toLowerCase().includes(term);
    }
  });

  if (loading) return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg text-center text-gray-700">
      Chargement en cours...
    </div>
  );

  if (error) return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg text-center">
      <p className="text-red-600 font-semibold">{error}</p>
      <button
        onClick={fetchServices}
        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition"
      >
        Réessayer
      </button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Liste des services</h2>
        <button
          onClick={() => navigate('/admin/ajout-service')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded shadow transition"
        >
          + Nouveau Service
        </button>
      </div>

      {/* Search Bar with Criteria Selection */}
      <div className="mb-4 flex items-center gap-4">
        <select
          value={searchBy}
          onChange={(e) => setSearchBy(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="nom">Nom</option>
          <option value="id">Matricule</option>
        </select>
        <input
          type="text"
          placeholder={`Rechercher par ${searchBy === 'id' ? 'Matricule' : 'Nom'}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="border-b border-gray-300 px-5 py-3 text-left text-sm font-medium text-gray-700">Matricule</th>
            <th className="border-b border-gray-300 px-5 py-3 text-left text-sm font-medium text-gray-700">Nom</th>
            <th className="border-b border-gray-300 px-5 py-3 text-center text-sm font-medium text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredServices.length === 0 && (
            <tr>
              <td colSpan="3" className="text-center py-6 text-gray-500">Aucun service trouvé.</td>
            </tr>
          )}
          {filteredServices.map(service => (
            <tr key={service.id_service} className="hover:bg-gray-50 transition">
              <td className="border-b border-gray-200 px-5 py-3">{service.id_service}</td>
              <td className="border-b border-gray-200 px-5 py-3">{service.nom_service}</td>
              <td className="border-b border-gray-200 px-5 py-3 text-center space-x-2">
                <button
                  onClick={() => navigate(`/admin/modifier-service/${service.id_service}`)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1 rounded transition"
                >Modifier</button>
                <button
                  onClick={() => supprimerService(service.id_service)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded transition"
                >Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    
  );
};

export default ListeService;