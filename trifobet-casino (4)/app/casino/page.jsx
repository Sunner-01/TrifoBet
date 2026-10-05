"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useCasinoGames } from "@/hooks/useCasinoGames";
import { useCasinoFavorites } from "@/hooks/useCasinoFavorites";
import { CasinoHero } from "@/components/casino/CasinoHero";
import { GameCard } from "@/components/casino/GameCard";

export default function CasinoPage() {
  const { searchQuery, setSearchQuery, loading, filteredGames } = useCasinoGames();
  const favorites = useCasinoFavorites();
  const visibleGames = favorites.onlyFavorites
    ? filteredGames.filter((game) => favorites.favoriteIds.includes(Number(game.id)))
    : filteredGames;
  const waiting = loading || (favorites.onlyFavorites && favorites.loading);

  return (
    <div className="min-h-screen bg-background pb-20">
      <CasinoHero />
      <div className="container mt-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar juego o proveedor..." aria-label="Buscar juego o proveedor"
              className="pl-9 bg-card/50 border-muted" value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant={favorites.onlyFavorites ? "outline" : "default"}
              aria-pressed={!favorites.onlyFavorites} onClick={() => favorites.setOnlyFavorites(false)}>
              Todos los juegos
            </Button>
            <Button type="button" variant={favorites.onlyFavorites ? "default" : "outline"}
              aria-pressed={favorites.onlyFavorites} disabled={!favorites.isLoggedIn || favorites.loading}
              onClick={() => favorites.setOnlyFavorites(true)}>
              Mis favoritos
            </Button>
          </div>
        </div>
        {!favorites.isLoggedIn && (
          <p className="mb-4 text-sm text-muted-foreground">Inicia sesión para guardar y consultar tus favoritos.</p>
        )}
        {favorites.isLoggedIn && favorites.loading && (
          <p className="mb-4 text-sm text-muted-foreground" role="status">Cargando favoritos...</p>
        )}
        {favorites.error && <p role="alert" className="mb-4 text-red-500">{favorites.error}</p>}
        {waiting && (
          <div className="flex justify-center items-center py-20">
            <p role="status" className="text-lg text-muted-foreground">Cargando juegos...</p>
          </div>
        )}
        {!waiting && visibleGames.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {visibleGames.map((game) => (
              <GameCard key={game.id} game={game}
                isFavorite={favorites.favoriteIds.includes(Number(game.id))}
                favoritePending={favorites.loading || favorites.pendingIds.includes(Number(game.id))}
                onToggleFavorite={favorites.toggleFavorite} />
            ))}
          </div>
        ) : !waiting ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="text-xl font-bold mb-2">
              {favorites.onlyFavorites ? "No hay favoritos para esta búsqueda" : "No se encontraron juegos"}
            </h3>
            <p className="text-muted-foreground">
              {favorites.onlyFavorites
                ? "Agrega juegos con el corazón o cambia la búsqueda."
                : "Intenta con otra búsqueda."}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}