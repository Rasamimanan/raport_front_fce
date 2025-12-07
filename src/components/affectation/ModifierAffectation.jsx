import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const ModifierAffectation = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    id_employe: '',
    id_materiel: '',
    id_service_precedent: '',
    id_service_nouveau: '',
    date_affectation: '',
    quantite_affecte: 1,
  });

  const [employes, setEmployes] = useState([]);
  const [materiels, setMateriels] = useState([]);
  const [services, setServices] = useState([]);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Charger les données initiales (employes, materiels, services)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, matRes, servRes] = await Promise.all([
          axios.get('http://localhost:3000/api/employes'),
          axios.get('http://localhost:3000/api/materiels'),
          axios.get('http://localhost:3000/api/services'),
        ]);
        setEmployes(empRes.data);
        setMateriels(matRes.data);
        setServices(servRes.data);
      } catch {
        setError('Erreur lors du chargement des données');
      }
    };
    fetchData();
  }, []);

  // Charger les données de l'affectation à modifier
  useEffect(() => {
    const fetchAffectation = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/affectations/${id}`);
        const aff = res.data;

        setForm({
          id_employe: aff.id_employe,
          id_materiel: aff.id_materiel,
          id_service_precedent: aff.id_service_precedent, // ou aff.id_service_origine selon API
          id_service_nouveau: aff.id_service_nouveau,     // ou aff.id_service selon API
          date_affectation: aff.date_affectation.slice(0,10), // format YYYY-MM-DD
          quantite_affecte: aff.quantite_affecte,
        });
        setError(null);
      } catch {
        setError('Erreur lors du chargement de l\'affectation');
      }
    };
    fetchAffectation();
  }, [id]);

  // Mise à jour formulaire
  const handleMaterielChange = (e) => {
    const idMat = e.target.value;
    const materielChoisi = materiels.find(m => String(m.id_materiel) === idMat);
    setForm(form => ({
      ...form,
      id_materiel: idMat,
      id_service_precedent: materielChoisi ? String(materielChoisi.id_service) : '',
      id_service_nouveau: '',
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(form => ({
      ...form,
      [name]: name === 'quantite_affecte' ? parseInt(value, 10) || '' : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.id_employe || !form.id_materiel || !form.id_service_nouveau || !form.date_affectation || !form.quantite_affecte) {
      setError('Tous les champs sont obligatoires');
      setMessage(null);
      return;
    }

    if (form.id_service_precedent === form.id_service_nouveau) {
      setError('Le service d\'origine et le nouveau service doivent être différents');
      setMessage(null);
      return;
    }

    try {
      await axios.put(`http://localhost:3000/api/affectations/${id}`, form);
      setMessage('Affectation modifiée avec succès');
      setError(null);
      // redirection ou autre action après succès
      setTimeout(() => {
        navigate('/admin/liste-affectation');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la modification');
      setMessage(null);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl mb-4 font-bold">Modifier une Affectation</h2>

      {error && <div className="bg-red-200 text-red-800 p-2 rounded mb-4">{error}</div>}
      {message && <div className="bg-green-200 text-green-800 p-2 rounded mb-4">{message}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-semibold">Employé</label>
          <select name="id_employe" value={form.id_employe} onChange={handleChange} required
            className="w-full border rounded px-3 py-2">
            <option value="">-- Choisir employé --</option>
            {employes.map(emp => (
              <option key={emp.id_employe} value={emp.id_employe}>
                {emp.nom_employe} {emp.prenom_employe}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-semibold">Matériel</label>
          <select name="id_materiel" value={form.id_materiel} onChange={handleMaterielChange} required
            className="w-full border rounded px-3 py-2">
            <option value="">-- Choisir matériel --</option>
            {materiels.map(mat => (
              <option key={mat.id_materiel} value={mat.id_materiel}>
                {mat.nom_materiel}
              </option>
            ))}
          </select>
          {form.id_service_precedent && (
            <p className="mt-2 text-gray-700 italic">
              Service précédent : <strong>{services.find(s => String(s.id_service) === form.id_service_precedent)?.nom_service || 'Indéfini'}</strong>
            </p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-semibold">Nouveau service</label>
          <select name="id_service_nouveau" value={form.id_service_nouveau} onChange={handleChange} required
            className="w-full border rounded px-3 py-2">
            <option value="">-- Choisir nouveau service --</option>
            {services.map(serv => (
              <option key={serv.id_service} value={serv.id_service}>
                {serv.nom_service}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-semibold">Date d'affectation</label>
          <input type="date" name="date_affectation" value={form.date_affectation} onChange={handleChange} required
            className="w-full border rounded px-3 py-2" />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Quantité affectée</label>
          <input type="number" min="1" name="quantite_affecte" value={form.quantite_affecte} onChange={handleChange} required
            className="w-full border rounded px-3 py-2" />
        </div>

        <button type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
          Modifier
        </button>
      </form>
    </div>
  );
};

export default ModifierAffectation;
