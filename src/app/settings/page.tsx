"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { User, Lock, Bell, Palette, Save, Check } from "lucide-react";

const TEMAS = [
  { id: "light", label: "Claro", bg: "bg-white border-2", text: "text-gray-800" },
  { id: "dark", label: "Oscuro", bg: "bg-gray-900 border-2", text: "text-white" },
  { id: "system", label: "Sistema", bg: "bg-gradient-to-r from-white to-gray-900 border-2", text: "text-gray-600" },
];

const COLORES = [
  { id: "blue", clase: "bg-blue-600", var: "#2563eb" },
  { id: "purple", clase: "bg-purple-600", var: "#9333ea" },
  { id: "green", clase: "bg-green-600", var: "#16a34a" },
  { id: "orange", clase: "bg-orange-500", var: "#f97316" },
  { id: "pink", clase: "bg-pink-600", var: "#db2777" },
];

interface Configuracion {
  tema: string;
  color: string;
  notificaciones: Record<string, boolean>;
  perfil: Record<string, string>;
}

const configDefault: Configuracion = {
  tema: "light",
  color: "blue",
  notificaciones: {
    tareas: true,
    notas: true,
    recordatorios: true,
    logros: true,
    ranking: false,
  },
  perfil: {
    nombre: "",
    apellido: "",
    email: "",
    username: "",
  },
};

export default function SettingsPage() {
  const [tab, setTab] = useState<"perfil" | "seguridad" | "notificaciones" | "apariencia">("perfil");
  const [config, setConfig] = useState<Configuracion>(configDefault);
  const [saved, setSaved] = useState(false);

  // Cargar config guardada
  useEffect(() => {
    const stored = localStorage.getItem("app_config");
    if (stored) {
      const parsed = JSON.parse(stored);
      setConfig(parsed);
      aplicarTema(parsed.tema, parsed.color);
    } else {
      // Cargar datos del usuario
      const user = localStorage.getItem("user");
      if (user) {
        const u = JSON.parse(user);
        setConfig(prev => ({
          ...prev,
          perfil: {
            nombre: u.firstName ?? "",
            apellido: u.lastName ?? "",
            email: u.email ?? "",
            username: u.username ?? "",
          },
        }));
      }
    }
  }, []);

  const aplicarTema = (tema: string, color: string) => {
    const colorObj = COLORES.find(c => c.id === color);
    if (colorObj) {
      document.documentElement.style.setProperty("--color-primary", colorObj.var);
    }
    if (tema === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleTema = (tema: string) => {
    const nueva = { ...config, tema };
    setConfig(nueva);
    aplicarTema(tema, nueva.color);
  };

  const handleColor = (color: string) => {
    const nueva = { ...config, color };
    setConfig(nueva);
    aplicarTema(nueva.tema, color);
  };

  const handleNotificacion = (key: string) => {
    setConfig(prev => ({
      ...prev,
      notificaciones: {
        ...prev.notificaciones,
        [key]: !prev.notificaciones[key],
      },
    }));
  };

  const handlePerfil = (key: string, value: string) => {
    setConfig(prev => ({
      ...prev,
      perfil: { ...prev.perfil, [key]: value },
    }));
  };

  const handleSave = () => {
    localStorage.setItem("app_config", JSON.stringify(config));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
          <p className="text-gray-500 mt-1">Personaliza tu cuenta y preferencias</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap">
          {[
            { id: "perfil", label: "Perfil", icon: User },
            { id: "seguridad", label: "Seguridad", icon: Lock },
            { id: "notificaciones", label: "Notificaciones", icon: Bell },
            { id: "apariencia", label: "Apariencia", icon: Palette },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as typeof tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                tab === t.id
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              <t.icon size={15} />
              {t.label}
            </button>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          {/* Perfil */}
          {tab === "perfil" && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800">Información personal</h3>
              {[
                { key: "nombre", label: "Nombre", placeholder: "Tu nombre" },
                { key: "apellido", label: "Apellido", placeholder: "Tu apellido" },
                { key: "email", label: "Email", placeholder: "tu@email.com" },
                { key: "username", label: "Username", placeholder: "@usuario" },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs text-gray-500 mb-1 block">{f.label}</label>
                  <input
                    type="text"
                    placeholder={f.placeholder}
                    value={config.perfil[f.key] ?? ""}
                    onChange={e => handlePerfil(f.key, e.target.value)}
                    className="w-full bg-gray-100 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Seguridad */}
          {tab === "seguridad" && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800">Cambiar contraseña</h3>
              {[
                { label: "Contraseña actual", placeholder: "••••••••" },
                { label: "Nueva contraseña", placeholder: "••••••••" },
                { label: "Confirmar contraseña", placeholder: "••••••••" },
              ].map(f => (
                <div key={f.label}>
                  <label className="text-xs text-gray-500 mb-1 block">{f.label}</label>
                  <input
                    type="password"
                    placeholder={f.placeholder}
                    className="w-full bg-gray-100 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Notificaciones */}
          {tab === "notificaciones" && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800">Preferencias de notificaciones</h3>
              {[
                { key: "tareas", label: "Nuevas tareas", desc: "Cuando el profesor publique una tarea" },
                { key: "notas", label: "Notas publicadas", desc: "Cuando se publique una calificación" },
                { key: "recordatorios", label: "Recordatorios", desc: "Tareas próximas a vencer" },
                { key: "logros", label: "Logros desbloqueados", desc: "Cuando obtengas un nuevo logro" },
                { key: "ranking", label: "Ranking actualizado", desc: "Cambios en tu posición" },
              ].map(n => (
                <div key={n.key} className="flex items-center justify-between py-2 border-b border-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{n.label}</p>
                    <p className="text-xs text-gray-400">{n.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.notificaciones[n.key] ?? false}
                      onChange={() => handleNotificacion(n.key)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-5 peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                  </label>
                </div>
              ))}
            </div>
          )}

          {/* Apariencia */}
          {tab === "apariencia" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Tema</h3>
                <div className="grid grid-cols-3 gap-3">
                  {TEMAS.map(t => (
                    <button
                      key={t.id}
                      onClick={() => handleTema(t.id)}
                      className={`${t.bg} rounded-xl p-4 cursor-pointer text-center relative transition-all ${
                        config.tema === t.id ? "border-blue-500 shadow-md" : "border-gray-200"
                      }`}
                    >
                      {config.tema === t.id && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check size={11} className="text-white" />
                        </div>
                      )}
                      <p className={`text-sm font-medium ${t.text}`}>{t.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Color de acento</h3>
                <div className="flex gap-3">
                  {COLORES.map(c => (
                    <button
                      key={c.id}
                      onClick={() => handleColor(c.id)}
                      className={`w-9 h-9 rounded-full ${c.clase} hover:scale-110 transition-transform relative`}
                    >
                      {config.color === c.id && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check size={14} className="text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  El color seleccionado se aplica al sidebar y botones principales
                </p>
              </div>
            </div>
          )}

          <button
            onClick={handleSave}
            className={`mt-6 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              saved ? "bg-green-600 text-white" : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {saved ? <Check size={15} /> : <Save size={15} />}
            {saved ? "¡Guardado!" : "Guardar cambios"}
          </button>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
