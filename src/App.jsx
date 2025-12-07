import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';

// LAYOUTS
import LoginLayouts from './layouts/LoginLayouts';
import AdminFceLayouts from './layouts/AdminFceLayouts';

// LOGIN
import LoginResponsable from './components/login/LoginResponsable';
import CreationResponsable from './components/login/CreationResponsable';
import AdminVerification from './components/login/AdminVerification';

// DASHBOARD
import DashboardFce from './components/DashboardFce';
import AdminProfil from './components/AdminProfil'; // <-- ajouté

// AFFECTATION
import AjoutAffectation from './components/affectation/AjoutAffectation';
import ListeAffectation from './components/affectation/ListeAffectation';
import ModifierAffectation from './components/affectation/ModifierAffectation';

// CATEGORIE
import AjoutCategorie from './components/categorie/AjoutCategorie';
import ListeCategorie from './components/categorie/ListeCategorie';
import ModifierCategorie from './components/categorie/ModifierCategorie';

// EMPLOYE
import AjoutEmployee from './components/employee/AjoutEmployee';
import ListeEmployee from './components/employee/ListeEmployee';
import ModifierEmployee from './components/employee/ModifierEmployee';

// MATERIEL
import AjoutMateriel from './components/materiel/AjoutMateriel';
import ListeMateriel from './components/materiel/ListeMateriel';
import ModifierMateriel from './components/materiel/ModifierMateriel';

// MOUVEMENT
import AjoutMouvement from './components/mouvement/AjoutMouvement';
import ListeMouvement from './components/mouvement/ListeMouvement';
import ModifierMouvement from './components/mouvement/ModifierMouvement';
import MouvementsJour from './components/mouvement/MouvementsJour';

// SERVICE
import AjoutService from './components/service/AjoutService';
import ListeService from './components/service/ListeService';
import ModifierService from './components/service/ModifierService';

// ROUTE PROTÉGÉE
import PrivateRoute from './components/PrivateRoute';

// PAGE 404
const NotFound = () => (
  <div className="p-10 text-center text-gray-800 dark:text-gray-200">
    <h1 className="text-3xl text-red-600 dark:text-red-400">404 - Page non trouvée</h1>
    <p className="mt-4 text-blue-600 dark:text-blue-400">
      <Link to="/admin/dashboard" className="underline">
        Retour au tableau de bord
      </Link>
    </p>
  </div>
);

const App = () => {
  return (
    <div
      className="min-h-screen
                 bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200
                 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700
                 transition-colors duration-500"
    >
      <Routes>
        {/* ROUTES DE LOGIN */}
        <Route path="/" element={<LoginLayouts />}>
          <Route index element={<Navigate to="/login" replace />} />
          <Route path="login" element={<LoginResponsable />} />
          <Route path="creation-login" element={<CreationResponsable />} />
          <Route path="admin-verification" element={<AdminVerification />} />
        </Route>

        {/* ROUTES DE L'ADMIN - PROTÉGÉES */}
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminFceLayouts />
            </PrivateRoute>
          }
        >
          {/* Tableau de bord */}
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardFce />} />

          {/* Profil Admin */}
          <Route path="profil" element={<AdminProfil />} />

          {/* AFFECTATION */}
          <Route path="ajout-affectation" element={<AjoutAffectation />} />
          <Route path="ajout-affectation/:id_materiel" element={<AjoutAffectation />} />
          <Route path="liste-affectation" element={<ListeAffectation />} />
          <Route path="modifier-affectation/:id" element={<ModifierAffectation />} />

          {/* CATEGORIE */}
          <Route path="ajout-categorie" element={<AjoutCategorie />} />
          <Route path="liste-categorie" element={<ListeCategorie />} />
          <Route path="modifier-categorie/:id" element={<ModifierCategorie />} />

          {/* EMPLOYE */}
          <Route path="ajout-employee" element={<AjoutEmployee />} />
          <Route path="liste-employee" element={<ListeEmployee />} />
          <Route path="modifier-employee/:id" element={<ModifierEmployee />} />

          {/* MATERIEL */}
          <Route path="ajout-materiel" element={<AjoutMateriel />} />
          <Route path="liste-materiel" element={<ListeMateriel />} />
          <Route path="modifier-materiel/:id" element={<ModifierMateriel />} />

          {/* MOUVEMENT */}
          <Route path="ajout-mouvement" element={<AjoutMouvement />} />
          <Route path="ajout-mouvement/:id_materiel" element={<AjoutMouvement />} />
          <Route path="liste-mouvement" element={<ListeMouvement />} />
          <Route path="modifier-mouvement/:id" element={<ModifierMouvement />} />
          <Route path="mouvements-jour" element={<MouvementsJour />} />

          {/* SERVICE */}
          <Route path="ajout-service" element={<AjoutService />} />
          <Route path="liste-service" element={<ListeService />} />
          <Route path="modifier-service/:id" element={<ModifierService />} />
        </Route>

        {/* ROUTE 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

export default App;
