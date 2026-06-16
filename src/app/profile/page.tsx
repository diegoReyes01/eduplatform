'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
}

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Administrador',
  ADMIN: 'Administrador',
  TEACHER: 'Profesor',
  STUDENT: 'Estudiante',
  PARENT: 'Padre/Tutor',
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(stored));
  }, [router]);

  function handleLogout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    router.push('/login');
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-xl font-bold text-blue-600">
          EduPlatform
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">
            {user.firstName} {user.lastName}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm text-red-500 hover:text-red-700"
          >
            Cerrar sesión
          </button>
        </div>
      </nav>

      {/* Contenido */}
      <main className="max-w-2xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Mi perfil</h2>

        {success && (
          <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 text-sm">
            {success}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6">
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b">
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {user.firstName} {user.lastName}
              </h3>
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                {ROLE_LABELS[user.role] ?? user.role}
              </span>
            </div>
          </div>

          {/* Datos */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Email
              </label>
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                {user.email}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Username
              </label>
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                @{user.username}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Nombre completo
              </label>
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                {user.firstName} {user.lastName}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Rol
              </label>
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                {ROLE_LABELS[user.role] ?? user.role}
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t flex gap-3">
            <Link
              href="/dashboard"
              className="flex-1 text-center border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50"
            >
              Volver al dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
