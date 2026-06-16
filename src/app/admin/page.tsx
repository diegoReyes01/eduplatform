"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Search, Trash2, ChevronLeft, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import Link from "next/link";

interface Usuario {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  role: { id: string; name: string };
}

function getRolBadge(rol: string) {
  if (rol === "SUPER_ADMIN") return "bg-red-100 text-red-700";
  if (rol === "ADMIN") return "bg-orange-100 text-orange-700";
  if (rol === "TEACHER") return "bg-purple-100 text-purple-700";
  if (rol === "PARENT") return "bg-pink-100 text-pink-700";
  return "bg-blue-100 text-blue-700";
}

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filtroRol, setFiltroRol] = useState<"TODOS" | "STUDENT" | "TEACHER" | "ADMIN" | "SUPER_ADMIN">("TODOS");
  const [error, setError] = useState("");

  const cargarUsuarios = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setUsuarios(data.data);
      } else {
        setError(data.error?.message ?? "Error al cargar usuarios");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const filtered = usuarios.filter(u => {
    const nombre = `${u.firstName} ${u.lastName}`.toLowerCase();
    const matchSearch =
      nombre.includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase());
    const matchRol = filtroRol === "TODOS" || u.role.name === filtroRol;
    return matchSearch && matchRol;
  });

  const handleToggleActivo = async (id: string, actual: boolean) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !actual }),
      });
      const data = await res.json();
      if (data.success) {
        setUsuarios(usuarios.map(u => u.id === id ? { ...u, isActive: !actual } : u));
      }
    } catch {
      setError("Error al actualizar usuario");
    }
  };

  const handleCambiarRol = async (id: string, roleName: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ roleName }),
      });
      const data = await res.json();
      if (data.success) {
        setUsuarios(usuarios.map(u => u.id === id ? { ...u, role: data.data.role } : u));
      } else {
        setError(data.error?.message ?? "Error al cambiar rol");
      }
    } catch {
      setError("Error al cambiar rol");
    }
  };

  const handleEliminar = async (id: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`/api/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setUsuarios(usuarios.filter(u => u.id !== id));
      } else {
        setError(data.error?.message ?? "Error al eliminar");
      }
    } catch {
      setError("Error de conexión");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-gray-400 hover:text-gray-600">
              <ChevronLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
              <p className="text-gray-500 text-sm mt-0.5">{usuarios.length} usuarios registrados (datos reales)</p>
            </div>
          </div>
          <button
            onClick={cargarUsuarios}
            className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <RefreshCw size={16} className="text-gray-600" />
          </button>
        </motion.div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Estudiantes", value: usuarios.filter(u => u.role.name === "STUDENT").length, color: "blue" },
            { label: "Profesores", value: usuarios.filter(u => u.role.name === "TEACHER").length, color: "purple" },
            { label: "Activos", value: usuarios.filter(u => u.isActive).length, color: "green" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center"
            >
              <p className={`text-2xl font-bold text-${s.color}-600`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-gray-100 flex-1 min-w-48">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Buscar usuario..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent text-sm outline-none w-full"
            />
          </div>
          {(["TODOS", "STUDENT", "TEACHER", "ADMIN", "SUPER_ADMIN"] as const).map(rol => (
            <button
              key={rol}
              onClick={() => setFiltroRol(rol)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                filtroRol === rol
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {rol === "TODOS" ? "Todos" : rol}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-400 uppercase border-b border-gray-100">
                    <th className="px-5 py-3">Usuario</th>
                    <th className="px-5 py-3">Rol</th>
                    <th className="px-5 py-3 hidden sm:table-cell">Registro</th>
                    <th className="px-5 py-3 hidden md:table-cell">Último login</th>
                    <th className="px-5 py-3">Estado</th>
                    <th className="px-5 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u, i) => (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold shrink-0">
                            {u.firstName[0]}{u.lastName[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{u.firstName} {u.lastName}</p>
                            <p className="text-xs text-gray-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <select
                          value={u.role.name}
                          onChange={e => handleCambiarRol(u.id, e.target.value)}
                          className={`text-xs px-2 py-1 rounded-full font-medium border-0 outline-none cursor-pointer ${getRolBadge(u.role.name)}`}
                        >
                          <option value="STUDENT">STUDENT</option>
                          <option value="TEACHER">TEACHER</option>
                          <option value="ADMIN">ADMIN</option>
                          <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                          <option value="PARENT">PARENT</option>
                        </select>
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-500 hidden sm:table-cell">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-500 hidden md:table-cell">
                        {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-5 py-3">
                        <button onClick={() => handleToggleActivo(u.id, u.isActive)}>
                          {u.isActive
                            ? <CheckCircle size={18} className="text-green-500" />
                            : <XCircle size={18} className="text-gray-300" />
                          }
                        </button>
                      </td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => handleEliminar(u.id)}
                          className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center hover:bg-red-100 transition-colors"
                        >
                          <Trash2 size={13} className="text-red-500" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}