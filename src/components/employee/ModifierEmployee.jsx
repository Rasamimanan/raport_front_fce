import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const ModifierEmployee = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nom_employe: '',
    prenom_employe: '',
    poste: '',
    id_service: ''
  });

  const [services, setServices] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Récupération des données
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, servicesRes] = await Promise.all([
          axios.get(`http://localhost:3000/api/employes/${id}`),
          axios.get(`http://localhost:3000/api/services`),
        ]);

        setForm(empRes.data);
        setServices(servicesRes.data);
        setError(null);
      } catch (err) {
        setError("Erreur lors du chargement des données.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.put(`http://localhost:3000/api/employes/${id}`, form);
      Swal.fire({
        icon: 'success',
        title: 'Modifié avec succès',
        showConfirmButton: false,
        timer: 1500
      });
      navigate('/admin/liste-employee');
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: "Échec de la modification de l'employé."
      });
      console.error(err);
    }
  };

  if (loading)
    return (
      <div className="max-w-xl mx-auto p-6 bg-white shadow rounded-xl text-center text-gray-700">
        Chargement des données...
      </div>
    );

  if (error)
    return (
      <div className="max-w-xl mx-auto p-6 bg-white shadow rounded-xl text-center text-red-600">
        {error}
      </div>
    );

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Modifier l'employé</h2>
      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className="block mb-1 font-medium">Nom</label>
          <input
            name="nom_employe"
            type="text"
            value={form.nom_employe}
            onChange={handleChange}
            required
            className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Prénom</label>
          <input
            name="prenom_employe"
            type="text"
            value={form.prenom_employe}
            onChange={handleChange}
            required
            className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Poste</label>
          <input
            name="poste"
            type="text"
            value={form.poste}
            onChange={handleChange}
            required
            className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Service</label>
          <select
            name="id_service"
            value={form.id_service}
            onChange={handleChange}
            required
            className="w-full border px-4 py-2 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Sélectionner un service --</option>
            {services.map(service => (
              <option key={service.id_service} value={service.id_service}>
                {service.nom_service}
              </option>
            ))}
          </select>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
          >
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </div>
  );
};

export default ModifierEmployee;
