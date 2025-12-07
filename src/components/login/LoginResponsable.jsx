import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const LoginResponsable = () => {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [afficher, setAfficher] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const loading = Swal.fire({
      title: 'Connexion en cours...',
      text: 'Veuillez patienter quelques secondes...',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const res = await axios.post('http://localhost:3000/api/auth/login', {
        email,
        mot_de_passe: motDePasse,
      });

      // Simulation kely raha tianao ho hita tsara ny loading
      await new Promise(resolve => setTimeout(resolve, 1000));

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('responsable', JSON.stringify(res.data.responsable));

      Swal.fire({
        icon: 'success',
        title: 'Connexion réussie !',
        text: 'Redirection vers le tableau de bord...',
        showConfirmButton: false,
        timer: 2000,
      }).then(() => {
        navigate('/admin/dashboard');
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur de connexion',
        text: error.response?.data?.message || 'Une erreur est survenue. Veuillez réessayer.',
      });
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-900 text-black">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg w-96 space-y-4">
        <h2 className="text-2xl font-bold text-center">Connexion</h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type={afficher ? 'text' : 'password'}
          placeholder="Mot de passe"
          className="w-full p-2 border rounded"
          value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
          required
        />

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="afficher"
            checked={afficher}
            onChange={() => setAfficher(!afficher)}
          />
          <label htmlFor="afficher" className="text-sm text-gray-600">
            Afficher le mot de passe
          </label>
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200">
          Se connecter
        </button>
      </form>
    </div>
  );
};

export default LoginResponsable;
