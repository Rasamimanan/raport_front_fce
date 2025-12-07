import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const AjoutMateriel = () => {
  const [formData, setFormData] = useState({
    nom_materiel: '',
    quantite: '',
    id_categorie: '',
    id_service: '',
    etat: '',
    localisation: ''
  });

  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, servRes] = await Promise.all([
          axios.get('http://localhost:3000/api/categories'),
          axios.get('http://localhost:3000/api/services')
        ]);
        setCategories(catRes.data);
        setServices(servRes.data);
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: "Impossible de charger les catégories ou services"
        });
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.nom_materiel.trim()) throw new Error('Le nom du matériel est requis');
      if (!formData.quantite || isNaN(formData.quantite) || parseInt(formData.quantite) <= 0)
        throw new Error('La quantité doit être un nombre positif');

      const response = await axios.post('http://localhost:3000/api/materiels', {
        nom_materiel: formData.nom_materiel,
        quantite: parseInt(formData.quantite, 10),
        id_categorie: formData.id_categorie || null,
        id_service: formData.id_service || null,
        etat: formData.etat || null,
        localisation: formData.localisation || null
      });

      if (response.status === 201) {
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Matériel ajouté avec succès !',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'OK'
        }).then(() => {
          navigate('/admin/liste-materiel');
        });
      } else {
        throw new Error(`Réponse inattendue: ${response.status}`);
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: err.response?.data?.message || err.message || "Erreur lors de l'ajout"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4">Ajouter un Matériel</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700">Nom du matériel*</label>
          <input
            type="text"
            name="nom_materiel"
            value={formData.nom_materiel}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 px-4 py-2 rounded"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-gray-700">Quantité*</label>
          <input
            type="number"
            name="quantite"
            value={formData.quantite}
            onChange={handleChange}
            required
            min="1"
            className="w-full border border-gray-300 px-4 py-2 rounded"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-gray-700">Catégorie</label>
          <select
            name="id_categorie"
            value={formData.id_categorie}
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-2 rounded"
            disabled={loading}
          >
            <option value="">-- Choisir --</option>
            {categories.map(cat => (
              <option key={cat.id_categorie} value={cat.id_categorie}>
                {cat.nom_categorie}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-gray-700">Service</label>
          <select
            name="id_service"
            value={formData.id_service}
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-2 rounded"
            disabled={loading}
          >
            <option value="">-- Choisir --</option>
            {services.map(serv => (
              <option key={serv.id_service} value={serv.id_service}>
                {serv.nom_service}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-gray-700">État</label>
          <input
            type="text"
            name="etat"
            value={formData.etat}
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-2 rounded"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-gray-700">Localisation</label>
          <input
            type="text"
            name="localisation"
            value={formData.localisation}
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-2 rounded"
            disabled={loading}
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/admin/liste-materiel')}
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

export default AjoutMateriel;
