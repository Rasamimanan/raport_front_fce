import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const ModifierMateriel = () => {
  const { id } = useParams();
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
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSelectData = async () => {
      try {
        const [catRes, servRes] = await Promise.all([
          axios.get('http://localhost:3000/api/categories'),
          axios.get('http://localhost:3000/api/services')
        ]);
        setCategories(catRes.data);
        setServices(servRes.data);
      } catch (err) {
        console.error('Erreur chargement catégories/services', err);
      }
    };
    fetchSelectData();
  }, []);

  useEffect(() => {
    const fetchMateriel = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:3000/api/materiels/${id}`);
        setFormData({
          nom_materiel: res.data.nom_materiel,
          quantite: res.data.quantite.toString(),
          id_categorie: res.data.id_categorie || '',
          id_service: res.data.id_service || '',
          etat: res.data.etat || '',
          localisation: res.data.localisation || ''
        });
        setError(null);
      } catch (err) {
        setError('Erreur lors du chargement du matériel');
      } finally {
        setLoading(false);
      }
    };
    fetchMateriel();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await Swal.fire({
      title: 'Confirmer la modification',
      text: 'Voulez-vous vraiment enregistrer les modifications de ce matériel ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, modifier',
      cancelButtonText: 'Annuler'
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    setError(null);

    try {
      if (!formData.nom_materiel.trim()) throw new Error('Le nom du matériel est requis');
      if (!formData.quantite || isNaN(formData.quantite) || parseInt(formData.quantite) <= 0)
        throw new Error('La quantité doit être un nombre positif');

      const response = await axios.put(`http://localhost:3000/api/materiels/${id}`, {
        nom_materiel: formData.nom_materiel,
        quantite: parseInt(formData.quantite, 10),
        id_categorie: formData.id_categorie || null,
        id_service: formData.id_service || null,
        etat: formData.etat || null,
        localisation: formData.localisation || null
      });

      if (response.status === 200) {
        await Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Le matériel a été modifié avec succès',
          timer: 2000,
          showConfirmButton: false
        });

        navigate('/admin/liste-materiel');
      } else {
        throw new Error(`Réponse inattendue: ${response.status}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Erreur lors de la modification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Modifier le Matériel</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

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

export default ModifierMateriel;
