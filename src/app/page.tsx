import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">EduPlatform</h1>
        <p className="text-gray-600 mb-8">Plataforma educativa moderna</p>
        <Link
          href="/login"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Iniciar sesión
        </Link>
      </div>
    </div>
  );
}
