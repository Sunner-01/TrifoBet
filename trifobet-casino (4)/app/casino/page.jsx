"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

// SRP: Lógica extraída
import { CATEGORIES } from "@/lib/casino-utils";
import { useCasinoGames } from "@/hooks/useCasinoGames";

// SRP: Componentes extraídos
import { CasinoHero } from "@/components/casino/CasinoHero";
import { GameCard } from "@/components/casino/GameCard";

export default function CasinoPage() {
  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    loading,
    filteredGames
  } = useCasinoGames();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <CasinoHero />

      <div className="container mt-8">
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar juego o proveedor..."
              className="pl-9 bg-card/50 border-muted"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Categorías ocultas a petición del usuario
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
            {CATEGORIES.map((category) => (
              ...
            ))}
          </div>
          */}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <p className="text-lg text-muted-foreground">Cargando juegos...</p>
          </div>
        )}

        {/* Games Grid */}
        {!loading && filteredGames.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {filteredGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        ) : !loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-muted/20 rounded-full p-6 mb-4">
              <Search className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No se encontraron juegos</h3>
            <p className="text-muted-foreground">
              Intenta con otra búsqueda o categoría.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}