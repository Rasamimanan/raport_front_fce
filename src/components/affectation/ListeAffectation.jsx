import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaUsers, FaBuilding, FaExchangeAlt, FaBox } from 'react-icons/fa';
import Swal from 'sweetalert2';

const ListeAffectation = () => {
  const [affectations, setAffectations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [searchField, setSearchField] = useState('employe');

  // --- Récupération des affectations ---
  const fetchAffectations = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:3000/api/affectations');

      // Supprimer les doublons par id_affectation
      const unique = Array.from(new Map(res.data.map(item => [item.id_affectation, item])).values());
      setAffectations(unique);

      setError(null);
    } catch {
      setError('Erreur lors du chargement des affectations');
    } finally {
      setLoading(false);
    }
  };

  // --- Suppression d'une affectation avec SweetAlert ---
  const supprimerAffectation = async (id) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Cette affectation sera supprimée définitivement !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:3000/api/affectations/${id}`);
        setAffectations(prev => prev.filter(aff => aff.id_affectation !== id));
        Swal.fire('Supprimé !', 'L\'affectation a été supprimée.', 'success');
      } catch {
        Swal.fire('Erreur', 'Impossible de supprimer cette affectation', 'error');
      }
    }
  };

  // --- Formatage de la date ---
  const formatDate = (isoDate) => {
    if (!isoDate) return '-';
    const date = new Date(isoDate);
    return date.toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // --- Filtrage selon la recherche ---
  const filteredAffectations = affectations.filter((aff) => {
    const value = search.toLowerCase();
    switch (searchField) {
      case 'employe':
        return (`${aff.nom_employe} ${aff.prenom_employe}`).toLowerCase().includes(value);
      case 'materiel':
        return aff.nom_materiel.toLowerCase().includes(value);
      case 'service_origine':
        return (aff.service_precedent || '').toLowerCase().includes(value);
      case 'service_affectation':
        return (aff.service_nouveau || '').toLowerCase().includes(value);
      case 'date':
        return formatDate(aff.date_affectation).toLowerCase().includes(value);
      default:
        return true;
    }
  });

  // --- Statistiques ---
  const total = affectations.length;
  const servicesOrigine = [...new Set(affectations.map(a => a.service_precedent).filter(Boolean))].length;
  const servicesAffectation = [...new Set(affectations.map(a => a.service_nouveau).filter(Boolean))].length;
  const quantiteTotale = affectations.reduce((sum, a) => sum + Number(a.quantite_affecte || 0), 0);

  useEffect(() => {
    fetchAffectations();
    const intervalId = setInterval(fetchAffectations, 600000); // toutes les 10 minutes
    return () => clearInterval(intervalId);
  }, []);

  if (loading) return <div className="text-center text-gray-600">Chargement en cours...</div>;
  if (error) return (
    <div className="text-center text-red-600">
      <p>{error}</p>
      <button onClick={fetchAffectations} className="mt-2 text-blue-600 underline">Réessayer</button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white shadow rounded-xl">
      {/* --- Titre et bouton Ajouter --- */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Liste des affectations</h2>
        <Link to="/admin/ajout-affectation" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">+ Ajouter</Link>
      </div>

      {/* --- Statistiques --- */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-100 text-blue-800 rounded-xl p-5 flex items-center gap-3 shadow hover:shadow-lg transition">
          <FaUsers className="text-3xl" />
          <div>
            <p className="text-lg font-semibold">{total}</p>
            <p className="text-sm">Total affectations</p>
          </div>
        </div>
        <div className="bg-green-100 text-green-800 rounded-xl p-5 flex items-center gap-3 shadow hover:shadow-lg transition">
          <FaBuilding className="text-3xl" />
          <div>
            <p className="text-lg font-semibold">{servicesOrigine}</p>
            <p className="text-sm">Services d'origine</p>
          </div>
        </div>
        <div className="bg-yellow-100 text-yellow-800 rounded-xl p-5 flex items-center gap-3 shadow hover:shadow-lg transition">
          <FaExchangeAlt className="text-3xl" />
          <div>
            <p className="text-lg font-semibold">{servicesAffectation}</p>
            <p className="text-sm">Services affectation</p>
          </div>
        </div>
        <div className="bg-orange-100 text-orange-800 rounded-xl p-5 flex items-center gap-3 shadow hover:shadow-lg transition">
          <FaBox className="text-3xl" />
          <div>
            <p className="text-lg font-semibold">{quantiteTotale}</p>
            <p className="text-sm">Quantité affectée</p>
          </div>
        </div>
      </div>

      {/* --- Barre de recherche --- */}
      <div className="flex items-center mb-4 gap-4">
        <select
          value={searchField}
          onChange={(e) => setSearchField(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="employe">Employé</option>
          <option value="materiel">Matériel</option>
          <option value="service_origine">Service d'origine</option>
          <option value="service_affectation">Service affectation</option>
          <option value="date">Date</option>
        </select>
        <input
          type="text"
          placeholder={`Rechercher par ${searchField.replace('_', ' ')}`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        />
      </div>

      {/* --- Tableau --- */}
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-blue-600 text-white">
            <th className="p-3 text-left">ID</th>
            <th className="p-3 text-left">Employé</th>
            <th className="p-3 text-left">Service d'origine</th>
            <th className="p-3 text-left">Service affectation</th>
            <th className="p-3 text-left">Matériel</th>
            <th className="p-3 text-left">Quantité</th>
            <th className="p-3 text-left">Date</th>
            <th className="p-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredAffectations.length === 0 ? (
            <tr>
              <td colSpan="8" className="p-4 text-center text-gray-500">Aucune affectation</td>
            </tr>
          ) : (
            filteredAffectations.map(aff => (
              <tr key={aff.id_affectation} className="border-b">
                <td className="p-3">{aff.id_affectation}</td>
                <td className="p-3">{aff.nom_employe} {aff.prenom_employe}</td>
                <td className="p-3">{aff.service_precedent || '-'}</td>
                <td className="p-3">{aff.service_nouveau || '-'}</td>
                <td className="p-3">{aff.nom_materiel}</td>
                <td className="p-3">{aff.quantite_affecte}</td>
                <td className="p-3">{formatDate(aff.date_affectation)}</td>
                <td className="p-3 flex justify-center gap-4">
                  <Link to={`/admin/modifier-affectation/${aff.id_affectation}`} className="text-blue-600 hover:underline">Modifier</Link>
                  <button onClick={() => supprimerAffectation(aff.id_affectation)} className="text-red-500 hover:underline">Supprimer</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ListeAffectation;
