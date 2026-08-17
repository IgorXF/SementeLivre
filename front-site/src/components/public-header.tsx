"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAuthUser, logout } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Sprout, LayoutDashboard, LogIn, LogOut } from "lucide-react";

export default function PublicHeader() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!getAuthUser());
  }, []);

  function handleLogout() {
    logout();
    setIsLoggedIn(false);
  }

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-green-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center group-hover:bg-green-700 transition-colors">
            <Sprout className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-green-900 text-lg tracking-tight">
            Semente Livre
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link href="/" className="hover:text-green-700 transition-colors">
            Início
          </Link>
          <Link href="/#sementes" className="hover:text-green-700 transition-colors">
            Sementes
          </Link>
          <Link href="/#sobre" className="hover:text-green-700 transition-colors">
            Sobre a Rede
          </Link>
        </nav>

        {/* Auth actions */}
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              <Button
                variant="outline"
                size="sm"
                className="border-green-200 text-green-700 hover:bg-green-50 gap-1.5"
                onClick={() => router.push("/dashboard/properties")}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Painel</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-red-600 hover:bg-red-50 gap-1.5"
                onClick={handleLogout}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-green-700 hover:bg-green-50 gap-1.5"
                onClick={() => router.push("/login")}
              >
                <LogIn className="w-3.5 h-3.5" />
                Entrar
              </Button>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white gap-1.5"
                onClick={() => router.push("/cadastro")}
              >
                Cadastrar-se
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
