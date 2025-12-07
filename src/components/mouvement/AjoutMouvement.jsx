import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const AjoutMouvement = () => {
  const [form, setForm] = useState({
    id_materiel: '',
    type_mouvement: '',
    quantite: '',
    date_mouvement: '',
    id_responsable: ''
  });

  const [materiels, setMateriels] = useState([]);
  const [responsables, setResponsables] = useState([]);
  const [selectedMateriel, setSelectedMateriel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const materielsRes = await axios.get('http://localhost:3000/api/materiels');
        setMateriels(materielsRes.data);

        const responsablesRes = await axios.get('http://localhost:3000/api/responsables');
        setResponsables(responsablesRes.data);

        setError(null);
      } catch (err) {
        console.error('Erreur chargement des données', err);
        setError('Erreur lors du chargement des données');
        Swal.fire('Erreur', 'Erreur lors du chargement des données', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleMaterielChange = (e) => {
    const materielId = e.target.value;
    const materiel = materiels.find(m => m.id_materiel == materielId);
    setSelectedMateriel(materiel);
    setForm({ ...form, id_materiel: materielId, quantite: '' });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validation
      if (!form.id_materiel) throw new Error('Veuillez sélectionner un matériel');
      if (!form.type_mouvement) throw new Error('Veuillez sélectionner un type de mouvement');
      if (!form.quantite || isNaN(form.quantite) || form.quantite <= 0) throw new Error('La quantité doit être un nombre positif');
      if (!form.date_mouvement) throw new Error('Veuillez sélectionner une date');
      if (!form.id_responsable) throw new Error('Veuillez sélectionner un responsable');

      const quantite = parseInt(form.quantite, 10);

      if (form.type_mouvement === 'sortie' && selectedMateriel && quantite > selectedMateriel.quantite) {
        throw new Error(`Quantité indisponible. Stock actuel: ${selectedMateriel.quantite}`);
      }

      await axios.post('http://localhost:3000/api/mouvements', {
        id_materiel: form.id_materiel,
        type_mouvement: form.type_mouvement,
        quantite: quantite,
        date_mouvement: form.date_mouvement,
        id_responsable: form.id_responsable
      });

      await Swal.fire({
        icon: 'success',
        title: 'Mouvement ajouté',
        text: 'Le mouvement a été enregistré avec succès',
        timer: 2000,
        showConfirmButton: false
      });

      navigate('/admin/liste-mouvement');
    } catch (err) {
      console.error('Erreur ajout mouvement', err);
      const message = err.response?.data?.message || err.message || "Une erreur est survenue";
      setError(message);

      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Ajouter un Mouvement</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Sélection du matériel */}
        <div>
          <label className="block mb-1">Matériel*</label>
          <select
            name="id_materiel"
            value={form.id_materiel}
            onChange={handleMaterielChange}
            className="w-full px-4 py-2 border rounded"
            required
            disabled={loading}
          >
            <option value="">-- Choisir un matériel --</option>
            {materiels.map((mat) => (
              <option key={`mat-${mat.id_materiel}`} value={mat.id_materiel}>
                {mat.nom_materiel} (Stock: {mat.quantite})
              </option>
            ))}
          </select>
        </div>

        {/* Type de mouvement */}
        <div>
          <label className="block mb-1">Type de mouvement*</label>
          <select
            name="type_mouvement"
            value={form.type_mouvement}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded"
            required
            disabled={loading}
          >
            <option value="">-- Choisir le type --</option>
            <option value="sortie">Sortie</option>
          </select>
        </div>

        {/* Quantité */}
        <div>
          <label className="block mb-1">Quantité*</label>
          <input
            type="number"
            name="quantite"
            value={form.quantite}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded"
            required
            min="1"
            max={form.type_mouvement === 'sortie' && selectedMateriel ? selectedMateriel.quantite : ''}
            disabled={loading || !form.id_materiel}
          />
          {selectedMateriel && form.type_mouvement === 'sortie' && (
            <p className="text-sm text-gray-500 mt-1">
              Stock disponible: {selectedMateriel.quantite}
            </p>
          )}
        </div>

        {/* Date */}
        <div>
          <label className="block mb-1">Date*</label>
          <input
            type="date"
            name="date_mouvement"
            value={form.date_mouvement}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded"
            required
            disabled={loading}
          />
        </div>

        {/* Sélection du responsable */}
        <div>
          <label className="block mb-1">Responsable*</label>
          <select
            name="id_responsable"
            value={form.id_responsable}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded"
            required
            disabled={loading}
          >
            <option value="">-- Choisir un responsable --</option>
            {responsables.map((resp) => (
              <option key={`resp-${resp.id_responsable}`} value={resp.id_responsable}>
                {resp.nom_responsable}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-green-300"
          disabled={loading}
        >
          {loading ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </form>
    </div>
  );
};

export default AjoutMouvement;
