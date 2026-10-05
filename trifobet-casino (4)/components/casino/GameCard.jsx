import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getGameImage } from "@/lib/casino-utils";

export function GameCard({ game }) {
  return (
    <Link href={`/casino/play/${game.id}`}>
      <motion.div
        whileHover={{ y: -5, scale: 1.02 }}
        className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-card border border-border/50 shadow-lg cursor-pointer"
      >
        <Image
          src={getGameImage(game)}
          alt={game.nombre}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center z-20">
          <Button className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-y-0 translate-y-4 bg-primary hover:bg-primary/90 font-bold px-8">
            Jugar
          </Button>
        </div>

        {/* Game Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-bold text-lg leading-tight mb-1 truncate">
            {game.nombre}
          </h3>
          <p className="text-white/60 text-xs font-medium uppercase tracking-wider">
            {game.proveedor}
          </p>
        </div>

        {/* Live Badge */}
        {game.categoria === 'Casino en Vivo' && (
          <div className="absolute top-3 left-3">
            <Badge variant="destructive" className="flex items-center gap-1 px-2 h-5 text-[10px]">
              <span className="animate-pulse h-1.5 w-1.5 bg-white rounded-full" />
              LIVE
            </Badge>
          </div>
        )}
      </motion.div>
    </Link>
  );
}
