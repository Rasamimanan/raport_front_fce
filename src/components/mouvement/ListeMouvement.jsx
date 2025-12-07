import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaUndoAlt, FaArrowUp, FaArrowDown, FaBox, FaFileExcel } from 'react-icons/fa';
import { MdInventory } from 'react-icons/md';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const ListeMouvement = () => {
  const [mouvements, setMouvements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState('type');

  useEffect(() => {
    fetchMouvements();
  }, []);

  const fetchMouvements = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:3000/api/mouvements');
      setMouvements(res.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement des mouvements');
    } finally {
      setLoading(false);
    }
  };

  const supprimerMouvement = async (id) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Cette action est irréversible !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:3000/api/mouvements/${id}`);
        setMouvements((prev) => prev.filter((m) => m.id_mouvement !== id));
        Swal.fire({
          icon: 'success',
          title: 'Supprimé !',
          text: 'Mouvement supprimé.',
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (err) {
        console.error(err);
        Swal.fire({ icon: 'error', title: 'Erreur', text: 'Erreur lors de la suppression' });
      }
    }
  };

  const retourMouvement = async (id) => {
    const result = await Swal.fire({
      title: 'Retour mouvement ?',
      text: "Cela va rétablir la quantité du matériel.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Oui, retour',
      cancelButtonText: 'Annuler',
    });

    if (result.isConfirmed) {
      try {
        await axios.put(`http://localhost:3000/api/mouvements/retour/${id}`);
        Swal.fire({
          icon: 'success',
          title: 'Retour effectué',
          timer: 2000,
          showConfirmButton: false,
        });
        fetchMouvements();
      } catch (err) {
        console.error(err);
        Swal.fire({ icon: 'error', title: 'Erreur', text: 'Impossible de faire le retour' });
      }
    }
  };

  const filteredMouvements = mouvements.filter((mvt) => {
    const term = searchTerm.toLowerCase();
    if (searchBy === 'id') return mvt.id_mouvement.toString().includes(term);
    if (searchBy === 'type') return mvt.type_mouvement.toLowerCase().includes(term);
    if (searchBy === 'materiel') return mvt.id_materiel.toString().includes(term);
    return true;
  });

  const formatDate = (dateStr) => (dateStr ? new Date(dateStr).toLocaleDateString('fr-FR') : '');

  // Statistiques
  const total = mouvements.length;
  const retournes = mouvements.filter(
    (m) => m.type_mouvement.toLowerCase() === 'sortie' && m.retourne
  ).length;
  const sorties = mouvements.filter((m) => m.type_mouvement.toLowerCase() === 'sortie').length;
  const nonRetournes = mouvements.filter(
    (m) => m.type_mouvement.toLowerCase() === 'sortie' && !m.retourne
  ).length;

  const exportExcel = () => {
    if (!filteredMouvements.length) return;

    const data = filteredMouvements.map((mvt) => ({
      "ID Mouvement": mvt.id_mouvement,
      "Type": mvt.type_mouvement,
      "Quantité": mvt.quantite,
      "Date Mouvement": formatDate(mvt.date_mouvement),
      "Date Retour": formatDate(mvt.date_retour),
      "ID Matériel": mvt.id_materiel,
      "ID Responsable": mvt.id_responsable,
      "Retourné": mvt.retourne ? 'Oui' : 'Non'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Mouvements");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "liste_mouvements.xlsx");
  };

  if (loading) return <p className="text-center mt-20 animate-pulse">Chargement...</p>;
  if (error) return <p className="text-center mt-20 text-red-600">{error}</p>;

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-2xl shadow-md">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
          <MdInventory className="text-blue-600 text-4xl" />
          Liste des Mouvements
        </h1>
        <div className="flex gap-3">
          <button
            onClick={exportExcel}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl text-base font-semibold shadow-lg transition flex items-center gap-2"
          >
            <FaFileExcel /> Exporter Excel
          </button>
          <Link
            to="/admin/ajout-mouvement"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl text-base font-semibold shadow-lg transition flex items-center gap-2"
          >
            <FaPlus /> Nouveau mouvement
          </Link>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-6">
        <div className="bg-blue-100 text-blue-800 rounded-xl p-5 flex items-center gap-3 shadow hover:shadow-lg transition">
          <FaBox size={28} />
          <div>
            <p className="text-lg font-semibold">{total}</p>
            <p className="text-sm">Total mouvements</p>
          </div>
        </div>
        <div className="bg-green-100 text-green-800 rounded-xl p-5 flex items-center gap-3 shadow hover:shadow-lg transition">
          <FaArrowDown size={28} />
          <div>
            <p className="text-lg font-semibold">{retournes}</p>
            <p className="text-sm">Retournés</p>
          </div>
        </div>
        <div className="bg-red-100 text-red-800 rounded-xl p-5 flex items-center gap-3 shadow hover:shadow-lg transition">
          <FaArrowUp size={28} />
          <div>
            <p className="text-lg font-semibold">{sorties}</p>
            <p className="text-sm">Sorties</p>
          </div>
        </div>
        <div className="bg-yellow-100 text-yellow-800 rounded-xl p-5 flex items-center gap-3 shadow hover:shadow-lg transition">
          <FaUndoAlt size={28} />
          <div>
            <p className="text-lg font-semibold">{nonRetournes}</p>
            <p className="text-sm">Non retournés</p>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <select
          value={searchBy}
          onChange={(e) => setSearchBy(e.target.value)}
          className="w-full sm:w-56 px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="type">Type</option>
          <option value="id">ID Mouvement</option>
          <option value="materiel">ID Matériel</option>
        </select>
        <div className="relative w-full sm:w-96">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={`Rechercher par ${
              searchBy === 'id' ? 'ID Mouvement' : searchBy === 'materiel' ? 'ID Matériel' : 'Type'
            }...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-5 py-3 rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto rounded-2xl shadow-inner border border-gray-200">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="bg-blue-700 text-white uppercase text-xs font-semibold tracking-wide">
            <tr>
              <th className="px-4 py-3">ID Mouvement</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Quantité</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Date Retour</th>
              <th className="px-4 py-3">ID Matériel</th>
              <th className="px-4 py-3">ID Responsable</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMouvements.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-8 text-gray-500 font-semibold">
                  Aucun mouvement trouvé.
                </td>
              </tr>
            ) : (
              filteredMouvements.map((mvt, i) => (
                <tr
                  key={mvt.id_mouvement}
                  className={`border-b transition hover:bg-blue-50 ${
                    i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="px-4 py-3 font-mono">{mvt.id_mouvement}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                        mvt.type_mouvement.toLowerCase() === 'entrée'
                          ? 'bg-green-100 text-green-800'
                          : mvt.type_mouvement.toLowerCase() === 'sortie'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      {mvt.type_mouvement}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold">{mvt.quantite}</td>
                  <td className="px-4 py-3">{formatDate(mvt.date_mouvement)}</td>
                  <td className="px-4 py-3">{formatDate(mvt.date_retour)}</td>
                  <td className="px-4 py-3 font-mono">{mvt.id_materiel}</td>
                  <td className="px-4 py-3 font-mono">{mvt.id_responsable}</td>
                  <td className="px-4 py-3 text-center flex justify-center items-center gap-3">
                    <Link
                      to={`/admin/modifier-mouvement/${mvt.id_mouvement}`}
                      className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-100 transition"
                      title="Modifier"
                    >
                      <FaEdit size={18} />
                    </Link>
                    <button
                      onClick={() => supprimerMouvement(mvt.id_mouvement)}
                      className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition"
                      title="Supprimer"
                    >
                      <FaTrash size={18} />
                    </button>
                    {mvt.type_mouvement.toLowerCase() === 'sortie' && !mvt.retourne && (
                      <button
                        onClick={() => retourMouvement(mvt.id_mouvement)}
                        className="text-yellow-600 hover:text-yellow-800 p-2 rounded-xl border border-yellow-200 hover:bg-yellow-100 flex items-center gap-1 transition"
                        title="Retourner mouvement"
                      >
                        <FaUndoAlt /> Retour
                      </button>
                    )}
                    {mvt.type_mouvement.toLowerCase() === 'sortie' && mvt.retourne && (
                      <span className="text-green-600 font-semibold flex items-center gap-1">
                        <FaUndoAlt /> Retourné
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListeMouvement;
