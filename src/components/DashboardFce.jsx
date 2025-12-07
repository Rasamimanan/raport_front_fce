import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Pie, Bar, Line, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Filler,
} from 'chart.js';
import { motion, AnimatePresence } from 'framer-motion';

ChartJS.register(
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale,
  PointElement, LineElement,
  BarElement, RadialLinearScale,
  Filler
);

const DashboardFce = () => {
  const [stats, setStats] = useState({
    nb_employes: 0,
    nb_materiels: 0,
    nb_services: 0,
    nb_affectations: 0,
    nb_quantite_affectee: 0,
    nb_mouvements: 0,
    nb_categories: 0,
  });

  const [showCharts, setShowCharts] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [
          employes,
          materiels,
          services,
          affectations,
          mouvements,
          categories,
        ] = await Promise.all([
          axios.get('http://localhost:3000/api/employes'),
          axios.get('http://localhost:3000/api/vues/stat-nb-materiels'),
          axios.get('http://localhost:3000/api/services'),
          axios.get('http://localhost:3000/api/vues/stat-materiel-affecte'),
          axios.get('http://localhost:3000/api/mouvements'),
          axios.get('http://localhost:3000/api/vues/stat-nb-categories'),
        ]);

        setStats({
          nb_employes: employes.data.length,
          nb_materiels: materiels.data.total_materiels,
          nb_services: services.data.length,
          nb_affectations: affectations.data.nb_affectations,
          nb_quantite_affectee: affectations.data.total_quantite_affectee,
          nb_mouvements: mouvements.data.length,
          nb_categories: categories.data.total_categories,
        });
      } catch (error) {
        console.error('Erreur chargement stats', error);
      }
    };

    fetchStats();
  }, []);

  const labels = [
    'Employés',
    'Matériels',
    'Services',
    'Affectations',
    'Qté Affectée',
    'Mouvements',
    'Catégories',
  ];

  const dataValues = [
    stats.nb_employes,
    stats.nb_materiels,
    stats.nb_services,
    stats.nb_affectations,
    stats.nb_quantite_affectee,
    stats.nb_mouvements,
    stats.nb_categories,
  ];

  const colors = [
    '#06b6d4', // Neon cyan
    '#10b981', // Green
    '#8b5cf6', // Purple
    '#f59e0b', // Yellow
    '#6366f1', // Indigo
    '#ef4444', // Red
    '#14b8a6', // Teal
  ];

  const chartData = {
    labels,
    datasets: [{
      label: 'Statistiques',
      data: dataValues,
      backgroundColor: colors.map(c => c + '80'), // Add 50% opacity
      borderColor: colors,
      borderWidth: 2,
      hoverBackgroundColor: colors,
      hoverBorderColor: colors,
    }],
  };

  const lineData = {
    labels,
    datasets: [{
      label: 'Évolution',
      data: dataValues,
      borderColor: '#06b6d4',
      backgroundColor: 'rgba(6, 182, 212, 0.2)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#06b6d4',
      pointBorderColor: '#ffffff',
      pointHoverBackgroundColor: '#ffffff',
      pointHoverBorderColor: '#06b6d4',
    }],
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#0F0C2A] to-[#1E1A4D] p-6 font-sans overflow-auto ml-auto max-w-[1600px] scrollbar-thin scrollbar-thumb-cyan-500 scrollbar-track-[#0F0C2A]">
      <motion.h1
        className="text-4xl font-extrabold text-center mb-10 text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)] select-none"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        📊 Tableau de bord - FCE
      </motion.h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { title: '👨‍💼 Employés', count: stats.nb_employes, color: 'from-[#1E3A8A] to-[#3B82F6]' },
          { title: '💻 Matériels', count: stats.nb_materiels, color: 'from-[#065F46] to-[#10B981]' },
          { title: '🏢 Services', count: stats.nb_services, color: 'from-[#4C1D95] to-[#8B5CF6]' },
          { title: '📦 Affectations', count: stats.nb_affectations, color: 'from-[#B45309] to-[#F59E0B]' },
          { title: '📊 Qté Affectée', count: stats.nb_quantite_affectee, color: 'from-[#3730A3] to-[#6366F1]' },
          { title: '🔄 Mouvements', count: stats.nb_mouvements, color: 'from-[#991B1B] to-[#EF4444]' },
          { title: '🗂️ Catégories', count: stats.nb_categories, color: 'from-[#134E4A] to-[#14B8A6]' },
        ].map(({ title, count, color }, i) => (
          <StatCard
            key={title}
            title={title}
            count={count}
            color={color}
            delay={i * 0.15}
          />
        ))}
      </div>

      <div className="flex justify-center">
        <motion.button
          onClick={() => setShowCharts(!showCharts)}
          className="bg-gradient-to-r from-cyan-500 to-violet-600 text-white px-8 py-3 rounded-xl text-lg font-semibold tracking-wide shadow-[0_0_10px_rgba(6,182,212,0.5)] hover:shadow-[0_0_15px_rgba(6,182,212,0.7)] transition-all duration-300 select-none"
          aria-expanded={showCharts}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {showCharts ? 'Masquer les statistiques' : 'Voir plus de statistiques'}
        </motion.button>
      </div>

      <AnimatePresence>
        {showCharts && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mt-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.7 }}
          >
            <ChartCard title="📍 Répartition (Pie)">
              <Pie data={chartData} />
            </ChartCard>
            <ChartCard title="📈 Comparaison (Bar)">
              <Bar data={chartData} />
            </ChartCard>
            <ChartCard title="📉 Évolution (Line)">
              <Line data={lineData} />
            </ChartCard>
            <ChartCard title="🕸️ Radar Global">
              <Radar data={chartData} />
            </ChartCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatCard = ({ title, count, color, delay }) => (
  <motion.div
    className={`rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.3)] bg-gradient-to-br ${color} text-white select-none`}
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ scale: 1.03, boxShadow: '0 0 15px rgba(6,182,212,0.5)' }}
    whileTap={{ scale: 0.97 }}
  >
    <div className="text-center">
      <h2 className="text-xl font-semibold mb-2 tracking-wide">{title}</h2>
      <p className="text-4xl font-extrabold">{count}</p>
    </div>
  </motion.div>
);

const ChartCard = ({ title, children }) => (
  <motion.div
    className="bg-[#1E1A4D] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.3)] p-6 hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all duration-300"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
  >
    <h2 className="text-center text-lg font-semibold text-cyan-400 mb-5 select-none">{title}</h2>
    <div className="max-w-full overflow-x-auto">{children}</div>
  </motion.div>
);

export default DashboardFce;