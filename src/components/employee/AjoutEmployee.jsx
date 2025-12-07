import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const AjoutEmployee = () => {
  const [form, setForm] = useState({
    nom_employe: '',
    prenom_employe: '',
    poste: '',
    id_service: '',
    id_role: ''
  });

  const [services, setServices] = useState([]);
  const [roles, setRoles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/services');
        setServices(res.data);
      } catch (err) {
        console.error('Erreur chargement services', err);
      }
    };
    const fetchRoles = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/roles');
        setRoles(res.data);
      } catch (err) {
        console.error('Erreur chargement roles', err);
      }
    };

    fetchServices();
    fetchRoles();
  }, []);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/employes', form);

      Swal.fire({
        icon: 'success',
        title: 'Succès',
        text: 'Employé ajouté avec succès !',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
      }).then(() => {
        navigate('/admin/liste-employee');
      });

    } catch (err) {
      console.error("Erreur lors de l'ajout", err);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: "Une erreur est survenue lors de l'ajout.",
        confirmButtonColor: '#d33'
      });
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Ajouter un Employé</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
      <div>
          <label className="block mb-1 font-medium">Matricule</label>
          <input
            name="id_employe"
            type="text"
            value={form.id_employe}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Nom</label>
          <input
            name="nom_employe"
            type="text"
            value={form.nom_employe}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Service</label>
          <select
            name="id_service"
            value={form.id_service}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 px-4 py-2 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Sélectionner un service --</option>
            {services.map(service => (
              <option key={service.id_service} value={service.id_service}>
                {service.nom_service}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          Enregistrer
        </button>
      </form>
    </div>
  );
};

export default AjoutEmployee;
