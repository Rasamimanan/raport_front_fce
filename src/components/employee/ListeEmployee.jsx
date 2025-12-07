import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

// Import icônes depuis react-icons
import { FiEdit2, FiTrash2, FiUserPlus, FiSearch, FiUsers, FiDownload } from 'react-icons/fi';

// Import pour export Excel
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const ListeEmployee = () => {
  const [employes, setEmployes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('nom');
  const [groupByService, setGroupByService] = useState(false);

  useEffect(() => {
    const fetchEmployes = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:3000/api/employes');
        setEmployes(res.data);
        setError(null);
      } catch (err) {
        setError("Erreur lors du chargement des employés.");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployes();
  }, []);

  const supprimerEmploye = (id) => {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Cette action est irréversible !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:3000/api/employes/${id}`);
          setEmployes(prev => prev.filter(emp => emp.id_employe !== id));
          Swal.fire('Supprimé !', 'L\'employé a été supprimé.', 'success');
        } catch {
          Swal.fire('Erreur', 'Erreur lors de la suppression.', 'error');
        }
      }
    });
  };

  const filteredEmployes = employes.filter(emp => {
    let value = '';
    switch (searchType) {
      case 'matricule': value = emp.id_employe?.toString().toLowerCase() || ''; break;
      case 'prenom': value = emp.prenom_employe?.toLowerCase() || ''; break;
      case 'poste': value = emp.poste?.toLowerCase() || ''; break;
      case 'service': value = emp.service?.nom_service?.toLowerCase() || ''; break;
      default: value = emp.nom_employe?.toLowerCase() || '';
    }
    return value.includes(searchTerm.toLowerCase());
  });

  const employesParService = filteredEmployes.reduce((group, emp) => {
    const serviceNom = emp.service?.nom_service || 'Sans service';
    if (!group[serviceNom]) group[serviceNom] = [];
    group[serviceNom].push(emp);
    return group;
  }, {});

  // Fonction pour exporter vers Excel avec titre personnalisé
  const exportToExcel = () => {
    let exportData = [];
    let title = "";

    if (groupByService) {
      title = "Liste des employés par service";
      // On ajoute une ligne de titre avant les données
      exportData.push([title]);
      exportData.push([]); // ligne vide

      Object.entries(employesParService).forEach(([serviceNom, emps]) => {
        exportData.push([`Service : ${serviceNom}`]);
        exportData.push(['Matricule', 'Nom', 'Prénom', 'Poste']);
        emps.forEach(emp => {
          exportData.push([
            emp.id_employe,
            emp.nom_employe,
            emp.prenom_employe,
            emp.poste,
          ]);
        });
        exportData.push([]); // ligne vide entre services
      });

      // Créer la feuille en partant d'un tableau brut
      const worksheet = XLSX.utils.aoa_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Employés");

      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const data = new Blob([excelBuffer], { type: "application/octet-stream" });
      saveAs(data, "liste_employes_par_service.xlsx");

    } else {
      title = "Liste complète des employés";

      exportData.push([title]);
      exportData.push([]);
      exportData.push(['Matricule', 'Nom', 'Prénom', 'Poste', 'Service']);

      filteredEmployes.forEach(emp => {
        exportData.push([
          emp.id_employe,
          emp.nom_employe,
          emp.prenom_employe,
          emp.poste,
          emp.service?.nom_service || '—',
        ]);
      });

      const worksheet = XLSX.utils.aoa_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Employés");

      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const data = new Blob([excelBuffer], { type: "application/octet-stream" });
      saveAs(data, "liste_employes.xlsx");
    }
  };

  if (loading) return <p className="text-center p-6 text-gray-600 animate-pulse text-lg flex items-center justify-center gap-2"><FiUsers size={24} /> Chargement en cours...</p>;

  if (error) return (
    <div className="text-center p-6 text-red-600">
      <p className="mb-2">{error}</p>
      <button
        onClick={() => window.location.reload()}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <FiSearch className="mr-2" /> Réessayer
      </button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-xl shadow-xl animate-fadeIn">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-6">
        <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
          <FiUsers size={36} className="text-blue-600" />
          Liste des employés
        </h2>

        <div className="flex gap-3">
          <button
            onClick={exportToExcel}
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-300 focus:outline-none focus:ring-4 focus:ring-green-500"
            aria-label="Exporter la liste en Excel"
            title="Exporter la liste en Excel"
          >
            <FiDownload size={20} /> Exporter Excel
          </button>

          <Link
            to="/admin/ajout-employee"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500"
            aria-label="Ajouter un employé"
          >
            <FiUserPlus size={20} /> + Ajouter
          </Link>
        </div>
      </header>

      {/* Barre recherche */}
      <div className="flex gap-3 mb-2">
        <select
          value={searchType}
          onChange={e => setSearchType(e.target.value)}
          className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 text-gray-700 font-medium"
          aria-label="Type de recherche"
        >
          <option value="nom">Nom</option>
          <option value="prenom">Prénom</option>
          <option value="poste">Poste</option>
          <option value="matricule">Matricule</option>
          <option value="service">Service</option>
        </select>
        <input
          type="text"
          placeholder={`Rechercher par ${searchType}`}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-grow border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 font-medium"
          aria-label="Recherche"
        />
      </div>

      {/* Toggle sous la recherche */}
      <div className="flex items-center gap-3 mb-8 select-none">
        <span className="text-gray-700 font-medium text-sm md:text-base flex items-center gap-2">
          <FiUsers className="text-blue-600" />
          Afficher par service
        </span>
        <button
          type="button"
          className={`w-12 h-6 flex items-center rounded-full p-1 duration-300 ease-in-out
            ${groupByService ? 'bg-blue-600 justify-end' : 'bg-gray-300 justify-start'}`}
          aria-pressed={groupByService}
          onClick={() => setGroupByService(prev => !prev)}
          aria-label="Basculer affichage par service"
        >
          <div className="w-4 h-4 rounded-full bg-white shadow-md transform duration-300 ease-in-out"></div>
        </button>
      </div>

      {/* Affichage de la liste */}
      {groupByService ? (
        Object.entries(employesParService).map(([serviceNom, emps]) => (
          <div key={serviceNom} className="mb-10">
            <h3 className="text-2xl font-semibold mb-3 border-b border-blue-600 pb-1 text-blue-600">
              Service : {serviceNom}
            </h3>
            <table className="w-full border border-gray-300 rounded-md overflow-hidden">
              <thead className="bg-blue-100 text-blue-800 font-semibold">
                <tr>
                  <th className="border border-gray-300 px-4 py-2">Matricule</th>
                  <th className="border border-gray-300 px-4 py-2">Nom</th>
                  <th className="border border-gray-300 px-4 py-2">Prénom</th>
                  <th className="border border-gray-300 px-4 py-2">Poste</th>
                  <th className="border border-gray-300 px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {emps.map(emp => (
                  <tr key={emp.id_employe} className="hover:bg-gray-100">
                    <td className="border border-gray-300 px-4 py-2 text-center">{emp.id_employe}</td>
                    <td className="border border-gray-300 px-4 py-2">{emp.nom_employe}</td>
                    <td className="border border-gray-300 px-4 py-2">{emp.prenom_employe}</td>
                    <td className="border border-gray-300 px-4 py-2">{emp.poste}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center flex justify-center gap-4">
                      <Link
                        to={`/admin/modifier-employee/${emp.id_employe}`}
                        className="text-blue-600 hover:text-blue-800"
                        aria-label={`Modifier ${emp.nom_employe}`}
                        title="Modifier"
                      >
                        <FiEdit2 />
                      </Link>
                      <button
                        onClick={() => supprimerEmploye(emp.id_employe)}
                        className="text-red-600 hover:text-red-800"
                        aria-label={`Supprimer ${emp.nom_employe}`}
                        title="Supprimer"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      ) : (
        <table className="w-full border border-gray-300 rounded-md overflow-hidden">
          <thead className="bg-blue-100 text-blue-800 font-semibold">
            <tr>
              <th className="border border-gray-300 px-4 py-2">Matricule</th>
              <th className="border border-gray-300 px-4 py-2">Nom</th>
              <th className="border border-gray-300 px-4 py-2">Prénom</th>
              <th className="border border-gray-300 px-4 py-2">Poste</th>
              <th className="border border-gray-300 px-4 py-2">Service</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployes.map(emp => (
              <tr key={emp.id_employe} className="hover:bg-gray-100">
                <td className="border border-gray-300 px-4 py-2 text-center">{emp.id_employe}</td>
                <td className="border border-gray-300 px-4 py-2">{emp.nom_employe}</td>
                <td className="border border-gray-300 px-4 py-2">{emp.prenom_employe}</td>
                <td className="border border-gray-300 px-4 py-2">{emp.poste}</td>
                <td className="border border-gray-300 px-4 py-2">{emp.service?.nom_service || '—'}</td>
                <td className="border border-gray-300 px-4 py-2 text-center flex justify-center gap-4">
                  <Link
                    to={`/admin/modifier-employee/${emp.id_employe}`}
                    className="text-blue-600 hover:text-blue-800"
                    aria-label={`Modifier ${emp.nom_employe}`}
                    title="Modifier"
                  >
                    <FiEdit2 />
                  </Link>
                  <button
                    onClick={() => supprimerEmploye(emp.id_employe)}
                    className="text-red-600 hover:text-red-800"
                    aria-label={`Supprimer ${emp.nom_employe}`}
                    title="Supprimer"
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ListeEmployee;
