"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  Trophy,
  Star,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  FlaskConical,
  Zap,
  Users,
  Shield,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/materias", label: "Materias", icon: BookOpen },
  { href: "/tareas", label: "Mis Tareas", icon: ClipboardList },
  { href: "/notas", label: "Mis Notas", icon: ClipboardList },
  { href: "/laboratorio", label: "Laboratorio 3D", icon: FlaskConical },
  { href: "/misiones", label: "Misiones", icon: Zap },
  { href: "/logros", label: "Logros", icon: Trophy },
  { href: "/ranking", label: "Ranking", icon: Star },
];

const navProfesor = [
  { href: "/profesor", label: "Panel Profesor", icon: Users },
];

const navAdmin = [
  { href: "/admin", label: "Administrador", icon: Shield },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const user = JSON.parse(stored);
        setRole(typeof user.role === "string" ? user.role : user.role?.name ?? null);
      } catch {
        setRole(null);
      }
    }
  }, []);

  const isTeacherOrAbove = role === "TEACHER" || role === "ADMIN" || role === "SUPER_ADMIN";
  const isAdminOrAbove = role === "ADMIN" || role === "SUPER_ADMIN";

  const renderItem = ({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) => {
    const active = pathname === href || pathname.startsWith(href + "/");
    return (
      <Link key={href} href={href}>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors cursor-pointer ${
            active
              ? "bg-blue-600 text-white shadow-md"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Icon size={20} className="shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-sm font-medium whitespace-nowrap"
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </Link>
    );
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative flex flex-col h-screen bg-white border-r border-gray-200 shadow-sm z-10 overflow-y-auto"
    >
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-100 shrink-0">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-600 text-white shrink-0">
          <GraduationCap size={20} />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="font-bold text-blue-600 text-lg whitespace-nowrap"
            >
              EduPlatform
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex flex-col gap-1 p-3">
        {navItems.map(renderItem)}
      </nav>

      {isTeacherOrAbove && (
        <div className="px-3 mt-2">
          {!collapsed && (
            <p className="text-xs text-gray-400 uppercase font-semibold px-3 mb-1">Profesor</p>
          )}
          <div className="flex flex-col gap-1">
            {navProfesor.map(renderItem)}
          </div>
        </div>
      )}

      {isAdminOrAbove && (
        <div className="px-3 mt-2">
          {!collapsed && (
            <p className="text-xs text-gray-400 uppercase font-semibold px-3 mb-1">Admin</p>
          )}
          <div className="flex flex-col gap-1">
            {navAdmin.map(renderItem)}
          </div>
        </div>
      )}

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-16 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
      >
        {collapsed ? (
          <ChevronRight size={12} className="text-gray-500" />
        ) : (
          <ChevronLeft size={12} className="text-gray-500" />
        )}
      </button>
    </motion.aside>
  );
}