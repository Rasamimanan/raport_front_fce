import React from 'react';
import { Outlet } from 'react-router-dom';
import LoginHeader from '../components/login/LoginHeader';

export default function LoginLayouts() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-900 via-pink-900 to-red-900 text-white flex flex-col">
      <LoginHeader />
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
