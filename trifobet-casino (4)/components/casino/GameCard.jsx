"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getGameImage } from "@/lib/casino-utils";

export function GameCard({ game, isFavorite = false, favoritePending = false, onToggleFavorite }) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-card border border-border/50 shadow-lg"
    >
      <Link href={`/casino/play/${game.id}`} className="block absolute inset-0" aria-label={`Jugar ${game.nombre}`}>
        <Image src={getGameImage(game)} alt={game.nombre} fill
          className="object-cover transition-transform duration-500 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center z-20">
          <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-primary text-primary-foreground rounded-md py-2 px-8 font-bold">Jugar</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-bold text-lg leading-tight mb-1 truncate">{game.nombre}</h3>
          <p className="text-white/60 text-xs font-medium uppercase tracking-wider">{game.proveedor}</p>
        </div>
        {game.categoria === "Casino en Vivo" && (
          <div className="absolute top-3 left-3">
            <Badge variant="destructive" className="flex items-center gap-1 px-2 h-5 text-[10px]">
              <span className="animate-pulse h-1.5 w-1.5 bg-white rounded-full" /> LIVE
            </Badge>
          </div>
        )}
      </Link>
      {onToggleFavorite && (
        <button type="button" disabled={favoritePending}
          onClick={() => onToggleFavorite(game.id)}
          aria-label={`${isFavorite ? "Quitar" : "Agregar"} ${game.nombre} ${isFavorite ? "de" : "a"} favoritos`}
          aria-pressed={isFavorite}
          className="absolute top-3 right-3 z-30 rounded-full bg-black/70 p-2 text-white disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
          <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
        </button>
      )}
    </motion.div>
  );
}
