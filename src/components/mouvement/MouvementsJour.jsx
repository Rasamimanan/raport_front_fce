import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MouvementsJour = () => {
  const [mouvements, setMouvements] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3000/api/mouvements/jour') // ✅ corrected
      .then(res => setMouvements(res.data))
      .catch(err => console.error('Erreur chargement mouvements du jour', err));
  }, []);

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Mouvements du jour</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mouvements.length === 0 ? (
          <p className="text-gray-500 col-span-full">Aucun mouvement enregistré aujourd’hui.</p>
        ) : (
          mouvements.map(m => (
            <div key={m.id_mouvement} className="bg-white shadow p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-green-700">Mouvement #{m.id_mouvement}</h3>
              <p><span className="font-medium">Matériel:</span> {m.id_materiel}</p>
              <p><span className="font-medium">Type:</span> {m.type_mouvement}</p> {/* ✅ corrected */}
              <p><span className="font-medium">Quantité:</span> {m.quantite}</p>
              <p><span className="font-medium">Date:</span> {m.date_mouvement}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MouvementsJour;
