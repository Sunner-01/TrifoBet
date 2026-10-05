"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Target, AlertCircle } from "lucide-react";
import BetSlip from "@/components/bet-slip";
import { LiveChat } from "@/components/live-chat";

// SRP: Componentes Extraídos
import { MatchBanner } from "@/components/apuestas/MatchBanner";
import { MarketsRenderer } from "@/components/apuestas/MarketsRenderer";

// SRP: Lógica Extraída
import { usePartidoLogic } from "@/hooks/usePartidoLogic";

const MARKET_TABS = [
  { id: "resultado", label: "Resultado" },
  { id: "goles", label: "Goles" },
  { id: "handicap", label: "Handicap" },
  { id: "ambos", label: "Ambos Marcan" },
  { id: "tiempo", label: "Mitades" },
  { id: "exacto", label: "Exacto" },
  { id: "corners", label: "Corners" },
  { id: "tarjetas", label: "Tarjetas" },
  { id: "especiales", label: "Especiales" },
];

export default function PartidoDetallePage({ params }) {
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;

  const {
    activeTab,
    setActiveTab,
    showBetSlip,
    setShowBetSlip,
    selectedBets,
    partido,
    mercados,
    loading,
    error,
    handleBetSelection,
    isBetSelected,
    removeBet,
    clearAllBets
  } = usePartidoLogic(id);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-muted-foreground">Cargando mercados...</span>
      </div>
    );
  }

  if (error || !partido) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground/40" />
        <p className="text-lg font-semibold">{error || "Partido no encontrado"}</p>
        <Link href="/apuestas" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
          <ArrowLeft className="h-4 w-4" />
          Volver a Apuestas
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Content (Match Details & Markets) */}
        <div className="lg:col-span-9 space-y-6">
          <div className="flex items-center gap-3">
            <Link
              href="/apuestas"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors text-sm font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Link>
            <div>
              <h1 className="text-xl font-bold">Mercados de Apuestas</h1>
              <p className="text-xs text-muted-foreground">{partido.liga}</p>
            </div>
          </div>

          <MatchBanner partido={partido} />

          <div>
            <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-hide">
              {MARKET_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border
                    ${activeTab === tab.id
                      ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/25"
                      : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <MarketsRenderer 
              activeTab={activeTab}
              mercados={mercados}
              isBetSelected={isBetSelected}
              handleBetSelection={handleBetSelection}
            />
          </div>
        </div>

        {/* Sidebar (Live Chat) */}
        <div className="hidden lg:block lg:col-span-3">
          <div className="sticky top-6">
            <LiveChat />
          </div>
        </div>
      </div>

      {selectedBets.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 lg:hidden">
          <button
            onClick={() => setShowBetSlip(true)}
            className="flex items-center gap-3 px-6 py-3 bg-primary text-primary-foreground rounded-2xl shadow-xl shadow-primary/30 font-bold text-sm"
          >
            <Target className="h-4 w-4" />
            <span>Ver Boleto</span>
            <span className="bg-primary-foreground/20 text-primary-foreground text-xs font-black px-2 py-0.5 rounded-full">
              {selectedBets.length}
            </span>
          </button>
        </div>
      )}

      <BetSlip
        open={showBetSlip}
        onOpenChange={setShowBetSlip}
        bets={selectedBets}
        onRemoveBet={removeBet}
        onClearAll={clearAllBets}
      />
    </div>
  );
}