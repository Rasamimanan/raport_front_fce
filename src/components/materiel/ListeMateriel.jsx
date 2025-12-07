import React, { useEffect, useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Link, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import debounce from 'lodash/debounce';
import { Pie, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const ListeMateriel = () => {
  const [materiels, setMateriels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState('nom');
  const [displayMode, setDisplayMode] = useState('global');
  const [exporting, setExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetails, setShowDetails] = useState(false);
  const [showStatsDetails, setShowStatsDetails] = useState({
    categorie: false,
    service: false,
    etat: false,
  });
  const itemsPerPage = 10;

  const navigate = useNavigate();

  // Fetch matériels
  const fetchMateriels = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:3000/api/materiels');
      setMateriels(res.data);
      setError(null);
    } catch (err) {
      setError(
        err.response
          ? `Erreur: ${err.response.data.message || 'Erreur serveur'}`
          : 'Erreur réseau. Vérifiez votre connexion.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Delete matériel
  const supprimerMateriel = async (id) => {
    const confirmation = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: 'Ce matériel sera définitivement supprimé.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#3b82f6',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler',
    });

    if (confirmation.isConfirmed) {
      try {
        await axios.delete(`http://localhost:3000/api/materiels/${id}`);
        setMateriels((prev) => prev.filter((mat) => mat.id_materiel !== id));
        Swal.fire({
          icon: 'success',
          title: 'Supprimé !',
          text: 'Le matériel a été supprimé avec succès.',
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: err.response?.data?.message || 'Impossible de supprimer ce matériel.',
        });
      }
    }
  };

  // Handle action change
  const handleActionChange = useCallback((e, id_materiel) => {
    const action = e.target.value;
    if (action === 'affecter') navigate(`/admin/ajout-affectation/${id_materiel}`);
    else if (action === 'mouvement') navigate(`/admin/ajout-mouvement/${id_materiel}`);
    e.target.value = '';
  }, [navigate]);

  // Debounced search
  const debouncedSetSearchTerm = useCallback(
    debounce((value) => {
      setSearchTerm(value);
      setCurrentPage(1);
    }, 300),
    []
  );

  useEffect(() => {
    fetchMateriels();
  }, []);

  // Filter and paginate data
  const filteredMateriels = useMemo(() => {
    return materiels.filter((mat) => {
      const term = searchTerm.toLowerCase();
      if (searchBy === 'id') return mat.id_materiel.toString().includes(term);
      if (searchBy === 'categorie') return (mat.nom_categorie || '').toLowerCase().includes(term);
      if (searchBy === 'service') return (mat.nom_service || '').toLowerCase().includes(term);
      return (mat.nom_materiel || '').toLowerCase().includes(term) && mat.quantite > 0; // Filter out quantite = 0
    });
  }, [materiels, searchTerm, searchBy]);

  const paginatedMateriels = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredMateriels.slice(start, end);
  }, [filteredMateriels, currentPage]);

  // Generic grouping function
  const groupByKey = (data, key) =>
    data.reduce((acc, mat) => {
      const group = mat[key] || 'Non spécifié';
      if (!acc[group]) acc[group] = [];
      acc[group].push(mat);
      return acc;
    }, {});

  const groupedByCategorie = useMemo(() => groupByKey(filteredMateriels, 'nom_categorie'), [filteredMateriels]);
  const groupedByService = useMemo(() => groupByKey(filteredMateriels, 'nom_service'), [filteredMateriels]);
  const groupedByEtat = useMemo(() => groupByKey(filteredMateriels, 'etat'), [filteredMateriels]);

  // Excel export
  const createWorksheet = (data) => {
    const formatted = data.map((mat) => ({
      ID: mat.id_materiel,
      Nom: mat.nom_materiel,
      Quantité: mat.quantite,
      Localisation: mat.localisation || 'Non spécifié',
      État: mat.etat || 'Non spécifié',
      Catégorie: mat.nom_categorie || 'Non spécifié',
      Service: mat.nom_service || 'Non spécifié',
    }));
    return XLSX.utils.json_to_sheet(formatted);
  };

  const saveAsExcel = (workbook, filename) => {
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, filename);
  };

  const exportToExcel = async () => {
    setExporting(true);
    const wb = XLSX.utils.book_new();
    try {
      if (displayMode === 'global') {
        const ws = createWorksheet(filteredMateriels);
        XLSX.utils.book_append_sheet(wb, ws, 'Matériels');
        saveAsExcel(wb, 'materiels_global.xlsx');
      } else if (displayMode === 'categorie') {
        Object.entries(groupedByCategorie).forEach(([cat, mats]) => {
          const ws = createWorksheet(mats);
          const sheetName = cat.length > 31 ? cat.substring(0, 28) + '...' : cat;
          XLSX.utils.book_append_sheet(wb, ws, sheetName);
        });
        saveAsExcel(wb, 'materiels_par_categorie.xlsx');
      } else if (displayMode === 'service') {
        Object.entries(groupedByService).forEach(([serv, mats]) => {
          const ws = createWorksheet(mats);
          const sheetName = serv.length > 31 ? serv.substring(0, 28) + '...' : serv;
          XLSX.utils.book_append_sheet(wb, ws, sheetName);
        });
        saveAsExcel(wb, 'materiels_par_service.xlsx');
      }
      Swal.fire({
        icon: 'success',
        title: 'Exporté !',
        text: 'Le fichier Excel a été généré avec succès.',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Erreur lors de l’exportation Excel.',
      });
    } finally {
      setExporting(false);
    }
  };

  // Action select component
  const ActionSelect = ({ id_materiel }) => (
    <select
      onChange={(e) => handleActionChange(e, id_materiel)}
      defaultValue=""
      className="border border-gray-200 rounded-md px-2 py-1 text-xs text-gray-600 bg-gray-50 hover:border-blue-400 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
      aria-label={`Choisir une action pour le matériel ${id_materiel}`}
    >
      <option value="" disabled>
        Actions...
      </option>
      <option value="affecter">Affecter</option>
      <option value="mouvement">Mouvement</option>
    </select>
  );

  // Skeleton loading component
  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="p-3">
        <div className="h-3 bg-gray-100 rounded w-10" />
      </td>
      <td className="p-3">
        <div className="h-3 bg-gray-100 rounded w-3/4" />
      </td>
      <td className="p-3 text-center">
        <div className="h-3 bg-gray-100 rounded w-6 mx-auto" />
      </td>
      <td className="p-3">
        <div className="h-3 bg-gray-100 rounded w-1/2" />
      </td>
      <td className="p-3">
        <div className="h-3 bg-gray-100 rounded w-1/3" />
      </td>
      <td className="p-3">
        <div className="h-3 bg-gray-100 rounded w-1/2" />
      </td>
      <td className="p-3">
        <div className="h-3 bg-gray-100 rounded w-1/2" />
      </td>
      <td className="p-3 flex justify-center gap-2">
        <div className="h-3 bg-gray-100 rounded w-4" />
        <div className="h-3 bg-gray-100 rounded w-4" />
        <div className="h-3 bg-gray-100 rounded w-16" />
      </td>
    </tr>
  );

  // Material table component
  const MaterielTable = ({ materiels }) => (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-xl bg-white">
      <table className="min-w-full table-auto divide-y divide-gray-100">
        <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <tr>
            <th scope="col" className="p-3 text-left text-xs font-bold tracking-wide">ID</th>
            <th scope="col" className="p-3 text-left text-xs font-bold tracking-wide">Nom</th>
            <th scope="col" className="p-3 text-center text-xs font-bold tracking-wide">Quantité</th>
            <th scope="col" className="p-3 text-left text-xs font-bold tracking-wide">Localisation</th>
            <th scope="col" className="p-3 text-left text-xs font-bold tracking-wide">État</th>
            <th scope="col" className="p-3 text-left text-xs font-bold tracking-wide">Catégorie</th>
            <th scope="col" className="p-3 text-left text-xs font-bold tracking-wide">Service</th>
            <th scope="col" className="p-3 text-center text-xs font-bold tracking-wide">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {loading
            ? Array.from({ length: 5 }).map((_, index) => <SkeletonRow key={index} />)
            : materiels.map((mat, index) => (
                <tr key={mat.id_materiel} className={`transition-all duration-300 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}>
                  <td className="p-3 text-gray-800 text-xs">{mat.id_materiel}</td>
                  <td className="p-3 text-gray-800 font-medium text-xs">{mat.nom_materiel}</td>
                  <td className="p-3 text-center text-gray-700 text-xs">{mat.quantite}</td>
                  <td className="p-3 text-gray-700 text-xs">{mat.localisation || 'Non spécifié'}</td>
                  <td className="p-3 text-gray-700 text-xs">{mat.etat || 'Non spécifié'}</td>
                  <td className="p-3 text-gray-700 text-xs">{mat.nom_categorie || 'Non spécifié'}</td>
                  <td className="p-3 text-gray-700 text-xs">{mat.nom_service || 'Non spécifié'}</td>
                  <td className="p-3 flex justify-center items-center gap-2">
                    <Link
                      to={`/admin/modifier-materiel/${mat.id_materiel}`}
                      className="text-blue-500 hover:text-blue-700 transition-all duration-300"
                      aria-label={`Modifier matériel ${mat.nom_materiel}`}
                    >
                      ✏️
                    </Link>
                    <button
                      onClick={() => supprimerMateriel(mat.id_materiel)}
                      className="text-red-500 hover:text-red-700 transition-all duration-300"
                      aria-label={`Supprimer matériel ${mat.nom_materiel}`}
                    >
                      🗑️
                    </button>
                    <ActionSelect id_materiel={mat.id_materiel} />
                  </td>
                </tr>
              ))}
        </tbody>
      </table>
      {displayMode === 'global' && (
        <div className="flex justify-between items-center mt-4 px-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-1.5 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-indigo-600 hover:scale-105 transition-all duration-300"
            aria-label="Page précédente"
          >
            Précédent
          </button>
          <span className="text-gray-600 text-xs font-medium">
            Page {currentPage} / {Math.ceil(filteredMateriels.length / itemsPerPage)}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={currentPage === Math.ceil(filteredMateriels.length / itemsPerPage)}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-1.5 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-indigo-600 hover:scale-105 transition-all duration-300"
            aria-label="Page suivante"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );

  // Stats component with fixed cards and expandable sections
  const MaterielStats = ({ materiels }) => {
    const totalMateriels = materiels.length;
    const totalDisponibles = materiels.reduce((acc, mat) => acc + mat.quantite, 0);

    const statsCategorie = useMemo(
      () =>
        materiels.reduce((acc, mat) => {
          const cat = mat.nom_categorie || 'Non spécifié';
          acc[cat] = (acc[cat] || 0) + mat.quantite;
          return acc;
        }, {}),
      [materiels]
    );

    const statsService = useMemo(
      () =>
        materiels.reduce((acc, mat) => {
          const serv = mat.nom_service || 'Non spécifié';
          acc[serv] = (acc[serv] || 0) + mat.quantite;
          return acc;
        }, {}),
      [materiels]
    );

    const statsEtat = useMemo(
      () =>
        materiels.reduce((acc, mat) => {
          const etat = mat.etat || 'Non spécifié';
          acc[etat] = (acc[etat] || 0) + mat.quantite;
          return acc;
        }, {}),
      [materiels]
    );

    const getEtatColor = (etat) => {
      switch (etat.toLowerCase()) {
        case 'bon':
          return 'bg-green-100 text-green-800';
        case 'moyen':
          return 'bg-yellow-100 text-yellow-800';
        case 'mauvais':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };

    const toggleStatsSection = (section) => {
      setShowStatsDetails((prev) => ({
        ...prev,
        [section]: !prev[section],
      }));
    };

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300">
          <p className="text-gray-600 font-medium text-xs">Matériels enregistrés</p>
          <p className="text-xl font-bold text-blue-800 mt-1">{totalMateriels}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300">
          <p className="text-gray-600 font-medium text-xs">Quantité disponible</p>
          <p className="text-xl font-bold text-green-800 mt-1">{totalDisponibles}</p>
        </div>
        <div className="bg-white p-3 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300">
          <button
            onClick={() => toggleStatsSection('categorie')}
            className="w-full text-left text-gray-700 font-bold text-xs flex justify-between items-center hover:text-blue-500 transition-all duration-300"
            aria-label={showStatsDetails.categorie ? "Masquer les statistiques par catégorie" : "Afficher les statistiques par catégorie"}
          >
            Par catégorie
            <span className="text-gray-500">{showStatsDetails.categorie ? '▼' : '▶'}</span>
          </button>
          {showStatsDetails.categorie && (
            <div className="mt-2 space-y-1 animate-slide-in">
              {Object.entries(statsCategorie).map(([cat, qty]) => (
                <div key={cat} className="bg-yellow-50 rounded-md p-1 text-xs text-center font-medium text-yellow-800">
                  {cat}: {qty}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white p-3 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300">
          <button
            onClick={() => toggleStatsSection('service')}
            className="w-full text-left text-gray-700 font-bold text-xs flex justify-between items-center hover:text-blue-500 transition-all duration-300"
            aria-label={showStatsDetails.service ? "Masquer les statistiques par service" : "Afficher les statistiques par service"}
          >
            Par service
            <span className="text-gray-500">{showStatsDetails.service ? '▼' : '▶'}</span>
          </button>
          {showStatsDetails.service && (
            <div className="mt-2 space-y-1 animate-slide-in">
              {Object.entries(statsService).map(([serv, qty]) => (
                <div key={serv} className="bg-purple-50 rounded-md p-1 text-xs text-center font-medium text-purple-800">
                  {serv}: {qty}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white p-3 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300">
          <button
            onClick={() => toggleStatsSection('etat')}
            className="w-full text-left text-gray-700 font-bold text-xs flex justify-between items-center hover:text-blue-500 transition-all duration-300"
            aria-label={showStatsDetails.etat ? "Masquer les statistiques par état" : "Afficher les statistiques par état"}
          >
            Par état
            <span className="text-gray-500">{showStatsDetails.etat ? '▼' : '▶'}</span>
          </button>
          {showStatsDetails.etat && (
            <div className="mt-2 space-y-1 animate-slide-in">
              {Object.entries(statsEtat).map(([etat, qty]) => (
                <div key={etat} className={`rounded-md p-1 text-xs text-center font-medium ${getEtatColor(etat)}`}>
                  {etat}: {qty}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Chart data
  const categoryChartData = useMemo(
    () => ({
      labels: Object.keys(groupedByCategorie),
      datasets: [
        {
          data: Object.values(groupedByCategorie).map((mats) =>
            mats.reduce((acc, mat) => acc + mat.quantite, 0)
          ),
          backgroundColor: ['#FF6B6B', '#4ECDC4', '#FFD93D', '#6AB04C', '#A66CFF', '#FF9F40'],
        },
      ],
    }),
    [groupedByCategorie]
  );

  const serviceChartData = useMemo(
    () => ({
      labels: Object.keys(groupedByService),
      datasets: [
        {
          label: 'Quantité par service',
          data: Object.values(groupedByService).map((mats) =>
            mats.reduce((acc, mat) => acc + mat.quantite, 0)
          ),
          backgroundColor: '#4B9CFF',
        },
      ],
    }),
    [groupedByService]
  );

  const etatChartData = useMemo(
    () => ({
      labels: Object.keys(groupedByEtat),
      datasets: [
        {
          data: Object.values(groupedByEtat).map((mats) =>
            mats.reduce((acc, mat) => acc + mat.quantite, 0)
          ),
          backgroundColor: ['#48BB78', '#ECC94B', '#F56565', '#A0AEC0'],
        },
      ],
    }),
    [groupedByEtat]
  );

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4 bg-white shadow-xl rounded-xl text-center space-y-4 animate-slide-in font-sans">
        <div className="flex justify-center">
          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <p className="text-gray-800 text-sm font-medium">{error}</p>
        <button
          onClick={fetchMateriels}
          className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold px-4 py-1.5 rounded-md shadow-md hover:from-blue-600 hover:to-indigo-600 hover:scale-105 transition-all duration-300"
          aria-label="Réessayer le chargement des matériels"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 bg-gray-100 shadow-xl rounded-2xl space-y-4 font-sans">
      <h1 className="text-2xl font-bold text-gray-900 mb-4 text-center tracking-tight">
        Gestion des Matériels
      </h1>

      <MaterielStats materiels={materiels} />

      <div className="bg-white p-3 rounded-xl shadow-xl border border-gray-100">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold px-4 py-1.5 rounded-md hover:from-blue-600 hover:to-indigo-600 hover:scale-105 transition-all duration-300 flex justify-between items-center"
          aria-label={showDetails ? "Masquer les graphiques" : "Afficher plus de détails"}
        >
          {showDetails ? 'Masquer les graphiques' : 'Plus de détails'}
          <span className="text-base">{showDetails ? '▼' : '▶'}</span>
        </button>
        {showDetails && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mt-3">
            <div className="bg-white p-2 rounded-xl shadow-xl border border-gray-100 max-w-xs mx-auto">
              <h2 className="text-xs font-bold text-gray-800 mb-2 text-center">Répartition par catégorie</h2>
              <div className="h-44">
                <Pie
                  data={categoryChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'top', labels: { font: { size: 10 } } },
                      title: { display: true, text: 'Répartition par catégorie', font: { size: 11 } },
                    },
                  }}
                />
              </div>
            </div>
            <div className="bg-white p-2 rounded-xl shadow-xl border border-gray-100 max-w-xs mx-auto">
              <h2 className="text-xs font-bold text-gray-800 mb-2 text-center">Quantité par service</h2>
              <div className="h-44">
                <Bar
                  data={serviceChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      title: { display: true, text: 'Quantité par service', font: { size: 11 } },
                    },
                    scales: {
                      y: { beginAtZero: true, ticks: { font: { size: 9 } } },
                      x: { ticks: { font: { size: 9 } } },
                    },
                  }}
                />
              </div>
            </div>
            <div className="bg-white p-2 rounded-xl shadow-xl border border-gray-100 max-w-xs mx-auto">
              <h2 className="text-xs font-bold text-gray-800 mb-2 text-center">Répartition par état</h2>
              <div className="h-44">
                <Doughnut
                  data={etatChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'top', labels: { font: { size: 10 } } },
                      title: { display: true, text: 'Répartition par état', font: { size: 11 } },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white p-3 rounded-xl shadow-xl border border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder={`Rechercher par ${searchBy}`}
            onChange={(e) => debouncedSetSearchTerm(e.target.value)}
            className="border border-gray-200 rounded-md px-3 py-1 bg-gray-50 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white shadow-sm transition-all duration-300 w-full sm:w-56"
            aria-label={`Recherche par ${searchBy}`}
          />
          <select
            value={searchBy}
            onChange={(e) => setSearchBy(e.target.value)}
            className="border border-gray-200 rounded-md px-3 py-1 bg-gray-50 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white shadow-sm transition-all duration-300"
            aria-label="Choisir le critère de recherche"
          >
            <option value="nom">Nom</option>
            <option value="id">ID</option>
            <option value="categorie">Catégorie</option>
            <option value="service">Service</option>
          </select>
        </div>

        <div className="flex gap-2 items-center">
          <Link
            to="/admin/ajout-materiel"
            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold px-4 py-1.5 rounded-md shadow-md hover:from-blue-600 hover:to-indigo-600 hover:scale-105 transition-all duration-300"
            aria-label="Ajouter un nouveau matériel"
          >
            Ajouter un nouveau matériel
          </Link>
          <label htmlFor="displayMode" className="font-bold text-gray-700 text-xs">
            Affichage :
          </label>
          <select
            id="displayMode"
            value={displayMode}
            onChange={(e) => {
              setDisplayMode(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-gray-200 rounded-md px-3 py-1 bg-gray-50 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white shadow-sm transition-all duration-300"
            aria-label="Choisir mode d'affichage"
          >
            <option value="global">Global</option>
            <option value="categorie">Par catégorie</option>
            <option value="service">Par service</option>
          </select>
          <button
            onClick={exportToExcel}
            disabled={exporting}
            className={`bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold px-4 py-1.5 rounded-md shadow-md transition-all duration-300 ${
              exporting ? 'opacity-50 cursor-not-allowed' : 'hover:from-blue-600 hover:to-indigo-600 hover:scale-105'
            }`}
            aria-label="Exporter vers Excel"
          >
            {exporting ? 'Exportation...' : 'Exporter Excel'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {displayMode === 'global' && <MaterielTable materiels={paginatedMateriels} />}
        {displayMode === 'categorie' &&
          Object.entries(groupedByCategorie).map(([categorie, mats]) => (
            <div key={categorie} className="mb-4 bg-white p-3 rounded-xl shadow-xl border border-gray-100 animate-slide-in">
              <h2 className="text-sm font-bold text-gray-800 mb-2 border-b border-gray-200 pb-1">
                {categorie}
              </h2>
              <MaterielTable materiels={mats} />
            </div>
          ))}
        {displayMode === 'service' &&
          Object.entries(groupedByService).map(([service, mats]) => (
            <div key={service} className="mb-4 bg-white p-3 rounded-xl shadow-xl border border-gray-100 animate-slide-in">
              <h2 className="text-sm font-bold text-gray-800 mb-2 border-b border-gray-200 pb-1">
                {service}
              </h2>
              <MaterielTable materiels={mats} />
            </div>
          ))}
        {filteredMateriels.length === 0 && (
          <div className="text-center bg-white p-3 rounded-xl shadow-xl border border-gray-100 text-gray-600 text-xs font-medium animate-slide-in">
            Aucun matériel trouvé.
          </div>
        )}
      </div>
    </div>
  );
};

export default ListeMateriel;