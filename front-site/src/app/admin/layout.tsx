"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAuthUser, logout, type AuthUser } from "@/lib/auth";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import {
  ClipboardList,
  Users,
  LogOut,
  Sprout,
  ChevronRight,
  Shield,
  Store,
} from "lucide-react";
import { useAdminPendingCount } from "@/hooks/use-admin-pending-count";

const navItems = [
  { href: "/admin/registrations", label: "Solicitações", icon: ClipboardList },
  { href: "/admin/comunidades", label: "Comunidades", icon: Users },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const pendingCount = useAdminPendingCount();

  useEffect(() => {
    const authUser = getAuthUser();
    if (!authUser || authUser.role !== "admin") {
      router.replace("/login");
    } else {
      setUser(authUser);
    }
  }, [router]);

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
      <aside className="w-60 bg-green-900 flex flex-col shadow-xl flex-shrink-0">
        {/* Brand */}
        <div className="p-5 border-b border-green-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
              <Sprout className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-white text-sm tracking-tight block leading-none">
                Semente Livre
              </span>
              <span className="text-[10px] text-green-400 font-medium flex items-center gap-1 mt-0.5">
                <Shield className="w-2.5 h-2.5" />
                Admin
              </span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-green-500 px-3 pt-3 pb-2">
            Painel Geral
          </p>
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-green-600 text-white shadow-sm"
                    : "text-green-200 hover:bg-green-800 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.href === "/admin/registrations" && pendingCount > 0 && (
                  <span className="text-[10px] font-bold bg-amber-400 text-amber-900 px-1.5 py-0.5 rounded-full">
                    {pendingCount}
                  </span>
                )}
                {active && (
                  <ChevronRight className="w-3.5 h-3.5 opacity-70" />
                )}
              </Link>
            );
          })}

          <div className="pt-3">
            <div className="h-px bg-green-800 mx-2 mb-3" />
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-green-300 hover:bg-green-800 hover:text-white transition-all"
            >
              <Store className="w-4 h-4 flex-shrink-0" />
              Ver loja pública
            </Link>
          </div>
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-green-800">
          <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-green-700 flex items-center justify-center flex-shrink-0">
              <Shield className="w-3.5 h-3.5 text-green-300" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {user.nome}
              </p>
              <p className="text-[10px] text-green-400 truncate">
                Administrador Geral
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start gap-2 text-green-400 hover:text-red-400 hover:bg-green-800 text-xs h-8"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sair
          </Button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-gray-100 flex items-center px-6 gap-2 shadow-sm flex-shrink-0">
          <span className="text-sm text-gray-400">Admin</span>
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
