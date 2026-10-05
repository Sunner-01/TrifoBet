"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, ChevronDown, Download } from "lucide-react";
import AuthModal from "@/components/auth-modal";
import BetHistory from "@/components/bet-history";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import BalanceModal from "@/components/balance-modal";
import ProfileModal from "@/components/profile-modal";
import YapeRechargeModal from "@/components/yape-recharge-modal";
import { apiGet } from "@/lib/api";
import { getStoredToken, getStoredUser, clearAuth, saveAuth } from "@/lib/auth";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState("login");
  const pathname = usePathname();
  const [userBalance, setUserBalance] = useState(0.00);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showYapeModal, setShowYapeModal] = useState(false);
  const [showHistorySheet, setShowHistorySheet] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState({
    id_usuario: null,
    name: "",
    email: "",
    avatar: "/placeholder.svg",
    saldo: 0.00,
    saldoRetenido: 0.00,
  });

  const routes = [
    { name: "Inicio", path: "/" },
    { name: "Apuestas", path: "/apuestas" },
    { name: "Casino", path: "/casino" },
    { name: "Promociones", path: "/promociones" },
    { name: "Nosotros", path: "/nosotros" },
    { name: "Soporte", path: "/soporte" },
  ];

  const openAuthModal = (tab) => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  useEffect(() => {
    const handleOpenAuth = (e) => {
      openAuthModal(e.detail?.tab || "login");
    };
    const handleOpenYape = () => {
      setShowYapeModal(true);
    };
    const handleOpenHistory = () => {
      setShowHistorySheet(true);
    };
    window.addEventListener("open-auth-modal", handleOpenAuth);
    window.addEventListener("open-yape-modal", handleOpenYape);
    window.addEventListener("open-bet-history", handleOpenHistory);
    return () => {
      window.removeEventListener("open-auth-modal", handleOpenAuth);
      window.removeEventListener("open-yape-modal", handleOpenYape);
      window.removeEventListener("open-bet-history", handleOpenHistory);
    };
  }, []);

  const handleLogin = (user) => {
    if (user) {
      setIsLoggedIn(true);
      setUserData({
        id_usuario: user.id_usuario,
        name: `${user.nombres || ""} ${user.apellido_1 || ""} ${user.apellido_2 || ""}`.trim() || "Usuario Anónimo",
        email: user.correo,
        avatar: user.foto_perfil || "/placeholder.svg",
        saldo: user.saldo,
        saldoRetenido: user.saldo_retenido || 0,
      });
      setUserBalance(user.saldo);
    }
    setAuthModalOpen(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserData({
      id_usuario: null,
      name: "",
      email: "",
      avatar: "/placeholder.svg",
      saldo: 0.00,
      saldoRetenido: 0.00,
    });
    setUserBalance(0.00);
    clearAuth();
  };

  // NUEVA FUNCIÓN DE DESCARGA
  const handleDownload = () => {
    const fileName = "app-trifobet.apk"; // ← Cambia esto por tu archivo real en /public
    const link = document.createElement("a");
    link.href = `/${fileName}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const loadAuth = async (event) => {
      let token = getStoredToken();
      let storedUser = getStoredUser();
      if (event?.detail?.user) {
        storedUser = event.detail.user;
        token = event.detail.token || token;
      }
      if (token) {
        try {
          const freshUser = await apiGet('/perfil/me');
          if (freshUser) {
            storedUser = freshUser;
            localStorage.setItem('user', JSON.stringify(freshUser));
          }
        } catch (error) {
          console.error("Error fetching fresh user data:", error);
        }
        if (storedUser) {
          setIsLoggedIn(true);
          let displayName = "Usuario";
          if (storedUser.nombres) {
            displayName = `${storedUser.nombres} ${storedUser.apellido_1 || ""}`.trim();
          } else if (storedUser.nombre_usuario) {
            displayName = storedUser.nombre_usuario;
          } else if (storedUser.usuario) {
            displayName = storedUser.usuario;
          } else if (storedUser.name) {
            displayName = storedUser.name;
          }
          setUserData({
            id_usuario: storedUser.id_usuario || storedUser.id,
            name: displayName,
            email: storedUser.correo || storedUser.email,
            avatar: storedUser.foto_perfil_url || storedUser.avatar || "/placeholder.svg",
            saldo: storedUser.saldo || 0.00,
            saldoRetenido: storedUser.saldo_retenido || 0.00,
          });
          setUserBalance(storedUser.saldo || 0.00);
        }
      } else {
        setIsLoggedIn(false);
        setUserData({
          id_usuario: null,
          name: "",
          email: "",
          avatar: "/placeholder.svg",
          saldo: 0.00,
        });
        setUserBalance(0.00);
      }
    };
    const refreshBalance = async () => {
      const token = getStoredToken();
      if (!token) return;
      try {
        const freshUser = await apiGet('/perfil/me');
        if (freshUser && freshUser.saldo !== undefined) {
          localStorage.setItem('user', JSON.stringify(freshUser));
          setUserBalance(Number(freshUser.saldo) || 0);
          setUserData(prev => ({ ...prev, saldo: Number(freshUser.saldo) || 0, saldoRetenido: Number(freshUser.saldo_retenido) || 0 }));
        }
      } catch (e) { console.error('Error refreshing balance:', e); }
    };

    loadAuth();
    window.addEventListener('auth-change', loadAuth);
    window.addEventListener('balance-updated', refreshBalance);

    // Polling cada 10 segundos para mantener saldo al día
    const interval = setInterval(() => {
      if (getStoredToken()) refreshBalance();
    }, 10000);

    return () => {
      window.removeEventListener('auth-change', loadAuth);
      window.removeEventListener('balance-updated', refreshBalance);
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="mr-2">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w[400px]">
                <nav className="flex flex-col gap-4 mt-8">
                  {routes.map((route) => (
                    <div key={route.path}>
                      {route.submenu ? (
                        <div className="space-y-3">
                          <div className="font-medium text-lg">{route.name}</div>
                          <div className="pl-4 space-y-2 border-l">
                            {route.submenu.map((subItem) => (
                              <Link
                                key={subItem.path}
                                href={subItem.path}
                                className={`block text-lg transition-colors hover:text-primary ${pathname === subItem.path ? "text-primary font-bold" : "text-muted-foreground"
                                  }`}
                                onClick={() => setIsOpen(false)}
                              >
                                {subItem.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <Link
                          href={route.path}
                          className={`block text-xl transition-colors hover:text-primary ${pathname === route.path || (route.path !== "/" && pathname.startsWith(route.path)) ? "text-primary font-bold" : "text-muted-foreground font-medium"
                            }`}
                          onClick={() => setIsOpen(false)}
                        >
                          {route.name}
                        </Link>
                      )}
                    </div>
                  ))}

                  {/* BOTÓN DESCARGAR EN MÓVIL */}
                  <Button
                    size="lg"
                    className="w-full mt-6"
                    onClick={() => {
                      handleDownload();
                      setIsOpen(false);
                    }}
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Descargar App
                  </Button>

                  {/* Mobile Auth/User Section */}
                  <div className="flex flex-col gap-2 mt-4 pt-4 border-t">
                    {!isLoggedIn ? (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsOpen(false);
                            openAuthModal("login");
                          }}
                          className="justify-start"
                        >
                          Iniciar Sesión
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsOpen(false);
                            openAuthModal("register");
                          }}
                          className="justify-start"
                        >
                          Registrarse
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsOpen(false);
                            setShowBalanceModal(true);
                          }}
                          className="justify-start"
                        >
                          Saldo: Bs {userBalance.toFixed(2)}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsOpen(false);
                            setShowProfileModal(true);
                          }}
                          className="justify-start"
                        >
                          Mi Perfil
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => {
                            setIsOpen(false);
                            handleLogout();
                          }}
                          className="justify-start"
                        >
                          Cerrar Sesión
                        </Button>
                      </>
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
            <Link href="/" className="flex items-center space-x-2">
              <img src="/icon.png" alt="TrifoBet Logo" className="w-8 h-8 rounded-full" />
              <span className="font-bold text-xl bg-gradient-to-r from-green-500 to-green-700 text-transparent bg-clip-text">
                TrifoBet
              </span>
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-6">
            {routes.map((route) => (
              <div key={route.path} className="relative group">
                {route.submenu ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className={`text-base transition-colors hover:text-primary flex items-center gap-1 ${pathname === route.path || pathname.startsWith(`${route.path}/`)
                          ? "text-primary font-bold"
                          : "text-muted-foreground font-medium"
                          }`}
                      >
                        {route.name}
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      {route.submenu.map((subItem) => (
                        <DropdownMenuItem key={subItem.path} asChild>
                          <Link
                            href={subItem.path}
                            className={`w-full text-base ${pathname === subItem.path ? "text-primary font-bold" : ""}`}
                          >
                            {subItem.name}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link
                    href={route.path}
                    className={`text-base transition-colors hover:text-primary ${pathname === route.path || (route.path !== "/" && pathname.startsWith(route.path)) ? "text-primary font-bold" : "text-muted-foreground font-medium"
                      }`}
                  >
                    {route.name}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            {/* BOTÓN DESCARGAR EN ESCRITORIO */}
            <Button
              size="sm"
              onClick={handleDownload}
              className="hidden sm:flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Descargar
            </Button>

            {/* Desktop Auth/User Section */}
            <div className="hidden sm:flex items-center gap-2">
              {isLoggedIn ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowBalanceModal(true)}
                    className="items-center gap-2 bg-green-50 hover:bg-green-100 border-green-200 text-green-700 dark:bg-green-950/20 dark:hover:bg-green-950/30 dark:border-green-800 dark:text-green-400"
                  >
                    <span className="font-bold">Bs {userBalance.toFixed(2)}</span>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Image
                          src={userData.avatar}
                          alt={userData.name}
                          fill
                          className="rounded-full object-cover border-2 border-muted"
                        />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-card text-card-foreground">
                      <div className="flex items-center justify-start gap-2 p-2 border-b border-border">
                        <div className="flex flex-col space-y-1 leading-none">
                          <p className="font-medium text-sm">{userData.name}</p>
                          <p className="text-xs text-muted-foreground">{userData.email}</p>
                        </div>
                      </div>
                      <div className="p-2 border-b border-border">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Saldo Disponible:</span>
                          <span className="font-bold text-primary">Bs {Number(userData.saldo).toFixed(2)}</span>
                        </div>
                        {userData.saldoRetenido > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Saldo Retenido:</span>
                            <span className="font-medium text-yellow-500">Bs {Number(userData.saldoRetenido).toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                      <DropdownMenuItem className="cursor-pointer hover:bg-accent hover:text-accent-foreground" onClick={() => setShowProfileModal(true)}>
                        Mi Perfil
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer hover:bg-accent hover:text-accent-foreground" onClick={handleLogout}>
                        Cerrar Sesión
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={() => openAuthModal("login")}>
                    Iniciar Sesión
                  </Button>
                  <Button size="sm" onClick={() => openAuthModal("register")}>
                    Registrarse
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab={authModalTab}
        onLogin={handleLogin}
      />
      <BalanceModal
        isOpen={showBalanceModal}
        onClose={() => setShowBalanceModal(false)}
        balance={userBalance}
        onBalanceUpdate={setUserBalance}
        onOpenYape={() => {
          setShowBalanceModal(false)
          setShowYapeModal(true)
        }}
      />
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        userData={userData}
        onUserDataUpdate={setUserData}
        onLogout={handleLogout}
      />
      <YapeRechargeModal
        isOpen={showYapeModal}
        onClose={() => setShowYapeModal(false)}
      />
      <Sheet open={showHistorySheet} onOpenChange={setShowHistorySheet}>
        <SheetTrigger asChild>
          <span style={{ display: 'none' }} />
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col h-full">
          <SheetHeader className="px-4 py-3 border-b shrink-0">
            <SheetTitle className="text-base">Mis Apuestas</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-hidden">
            <BetHistory />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}