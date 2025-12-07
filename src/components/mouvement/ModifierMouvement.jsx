import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

const ModifierMouvement = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    id_materiel: '',
    type_mouvement: '',
    quantite: '',
    date_mouvement: '',
    id_responsable: '',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMouvement = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:3000/api/mouvements/${id}`);
        setFormData({
          id_materiel: res.data.id_materiel || '',
          type_mouvement: res.data.type_mouvement || '',
          quantite: res.data.quantite || '',
          date_mouvement: res.data.date_mouvement ? res.data.date_mouvement.slice(0, 10) : '',
          id_responsable: res.data.id_responsable || '',
        });
        setError(null);
      } catch (err) {
        setError("Erreur lors du chargement du mouvement");
      } finally {
        setLoading(false);
      }
    };

    fetchMouvement();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.put(`http://localhost:3000/api/mouvements/${id}`, formData);
      Swal.fire({
        icon: 'success',
        title: 'Modifié !',
        text: 'Le mouvement a été mis à jour avec succès.',
        timer: 2000,
        showConfirmButton: false,
      });
      navigate('/admin/liste-mouvement');
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Erreur lors de la mise à jour du mouvement.',
      });
    }
  };

  if (loading) return <p>Chargement du mouvement...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow rounded-xl">
      <h2 className="text-2xl font-bold mb-4">Modifier un mouvement</h2>
      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className="block mb-1 font-semibold">ID Matériel</label>
          <input
            type="number"
            name="id_materiel"
            value={formData.id_materiel}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Type de mouvement</label>
          <input
            type="text"
            name="type_mouvement"
            value={formData.type_mouvement}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Quantité</label>
          <input
            type="number"
            name="quantite"
            value={formData.quantite}
            onChange={handleChange}
            required
            min="1"
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Date du mouvement</label>
          <input
            type="date"
            name="date_mouvement"
            value={formData.date_mouvement}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">ID Responsable</label>
          <input
            type="number"
            name="id_responsable"
            value={formData.id_responsable}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => navigate('/admin/liste-mouvement')}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          >
            Annuler
          </button>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
};

export default ModifierMouvement;
