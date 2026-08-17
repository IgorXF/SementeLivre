"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAuthUser, logout, type AuthUser } from "@/lib/auth";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import {
  Home,
  User,
  LogOut,
  Sprout,
  ChevronRight,
  Leaf,
  Shield,
  ShoppingBag,
} from "lucide-react";
import type { Notificacao } from "@/lib/types";

const navItems = [
  {
    href: "/dashboard/properties",
    label: "Propriedades",
    icon: Home,
  },
  {
    href: "/dashboard/catalog",
    label: "Catálogo de Sementes",
    icon: Leaf,
  },
  {
    href: "/dashboard/pedidos",
    label: "Pedidos Recebidos",
    icon: ShoppingBag,
  },
  {
    href: "/dashboard/profile",
    label: "Meu Perfil",
    icon: User,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const authUser = getAuthUser();
    if (!authUser) {
      router.replace("/login");
    } else {
      setUser(authUser);
    }
  }, [router]);

  useEffect(() => {
    if (!user?.id_comunidade) return;
    fetch(`/api/notificacoes?id_comunidade=${user.id_comunidade}`)
      .then((r) => r.json())
      .then((data: Notificacao[]) => {
        setUnreadCount(data.filter((n) => !n.lida).length);
      })
      .catch(() => {});
  }, [user, pathname]);

  function handleLogout() {
    logout();
    toast.info("Você saiu da sua conta.");
    router.replace("/");
  }

  if (!user) return null;

  const currentPage = navItems.find((n) => n.href === pathname);

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* ── Sidebar ── */}
      <aside className="w-60 bg-white border-r border-green-100 flex flex-col shadow-sm flex-shrink-0">
        {/* Brand */}
        <div className="p-5 border-b border-green-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
              <Sprout className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-green-900 text-base tracking-tight">
              Semente Livre
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 px-3 pt-3 pb-2">
            Menu
          </p>
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            const isPedidos = item.href === "/dashboard/pedidos";
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-green-600 text-white shadow-sm"
                    : "text-gray-600 hover:bg-green-50 hover:text-green-800"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {isPedidos && unreadCount > 0 && (
                  <span className="bg-yellow-400 text-yellow-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {unreadCount}
                  </span>
                )}
                {active && <ChevronRight className="w-3.5 h-3.5 opacity-70" />}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-green-100">
          <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <User className="w-3.5 h-3.5 text-green-700" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-700 truncate">
                {user.nome}
              </p>
              {user.nome_comunidade ? (
                <p className="text-[10px] text-green-600 font-medium truncate">
                  {user.nome_comunidade}
                </p>
              ) : (
                <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
              )}
            </div>
          </div>
          {user.role === "admin" && (
            <Link
              href="/admin/registrations"
              className="flex items-center gap-2 text-xs text-gray-500 hover:text-green-700 hover:bg-green-50 px-3 py-2 rounded-lg transition-colors mb-1"
            >
              <Shield className="w-3.5 h-3.5" />
              Painel Admin
            </Link>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start gap-2 text-gray-500 hover:text-red-600 hover:bg-red-50 text-xs h-8"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sair da conta
          </Button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center px-6 gap-2 shadow-sm flex-shrink-0">
          <span className="text-sm text-gray-400">Dashboard</span>
          {currentPage && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
              <span className="text-sm font-medium text-gray-700">
                {currentPage.label}
              </span>
            </>
          )}
        </header>

        <main className="flex-1 overflow-auto p-8">{children}</main>
      </div>
    </div>
  );
}
