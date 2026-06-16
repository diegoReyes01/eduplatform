"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Bell, Search, LogOut, User, Settings } from "lucide-react";
import { useState } from "react";

interface NavbarProps {
  user?: {
    firstName: string;
    lastName: string;
    role: string;
    avatar?: string | null;
  };
}

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const initials = user
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : "U";

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-20">
      {/* Search */}
      <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-4 py-2 w-72">
        <Search size={16} className="text-gray-400" />
        <input
          type="text"
          placeholder="Buscar materias, tareas..."
          className="bg-transparent text-sm text-gray-600 outline-none w-full placeholder:text-gray-400"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <Bell size={18} className="text-gray-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </motion.button>

          {showNotifications && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50"
            >
              <p className="font-semibold text-gray-800 mb-3">Notificaciones</p>
              <div className="flex flex-col gap-2">
                <div className="p-3 bg-blue-50 rounded-xl text-sm text-blue-700">
                  📚 Nueva tarea en Matemáticas
                </div>
                <div className="p-3 bg-green-50 rounded-xl text-sm text-green-700">
                  ✅ Nota publicada en Física
                </div>
                <div className="p-3 bg-purple-50 rounded-xl text-sm text-purple-700">
                  🏆 ¡Subiste al nivel 2!
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
              {initials}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-semibold text-gray-800">
                {user ? `${user.firstName} ${user.lastName}` : "Usuario"}
              </p>
              <p className="text-xs text-gray-400 capitalize">
                {user?.role?.toLowerCase() ?? "estudiante"}
              </p>
            </div>
          </motion.button>

          {showMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 top-12 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50"
            >
              <button
                onClick={() => router.push("/profile" as any)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <User size={16} />
                Mi Perfil
              </button>
              <button
                onClick={() => router.push("/settings" as any)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Settings size={16} />
                Configuración
              </button>
              <hr className="my-1 border-gray-100" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} />
                Cerrar sesión
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </header>
  );
}
