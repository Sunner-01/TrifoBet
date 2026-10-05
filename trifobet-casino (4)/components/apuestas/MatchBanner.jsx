import Image from "next/image";
import { Trophy, Radio, Clock } from "lucide-react";

export function MatchBanner({ partido }) {
  if (!partido) return null;

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="px-6 py-3 bg-muted/30 border-b border-border flex items-center justify-between">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Trophy className="h-3.5 w-3.5 text-primary/70" />
          {partido.liga}
        </span>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {partido.live && (
            <span className="flex items-center gap-1.5 text-red-500 font-bold text-[10px] bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20 uppercase">
              <Radio className="h-3 w-3 animate-pulse" />
              EN VIVO
            </span>
          )}
        </div>
      </div>

      <div className="px-6 py-8">
        <div className="flex items-center justify-between gap-6 max-w-2xl mx-auto">
          {/* Local */}
          <div className="flex flex-col items-center gap-3 flex-1">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-muted flex items-center justify-center overflow-hidden border border-border">
              <Image src={partido.logoLocal || "/placeholder.svg"} alt={partido.equipoLocal} width={72} height={72} className="object-contain" />
            </div>
            <span className="font-bold text-center text-sm sm:text-base leading-tight">{partido.equipoLocal}</span>
            <span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded">Local</span>
          </div>

          {/* Marcador/Hora */}
          <div className="flex flex-col items-center justify-center px-2 flex-shrink-0 min-w-[100px]">
            <div className="text-xs font-bold text-muted-foreground mb-2 whitespace-nowrap bg-muted/50 px-3 py-1 rounded-full uppercase">
              {partido.live ? (
                <span className="text-red-500 flex items-center gap-1.5"><Clock className="h-3 w-3"/>{partido.minuto}'</span>
              ) : (
                <span>{partido.fecha}</span>
              )}
            </div>
            
            {partido.live ? (
              <div className="text-4xl sm:text-5xl font-black tabular-nums text-primary tracking-tighter">
                {partido.marcadorLocal} - {partido.marcadorVisitante}
              </div>
            ) : (
              <div className="text-2xl sm:text-3xl font-black text-muted-foreground/50">VS</div>
            )}
          </div>

          {/* Visitante */}
          <div className="flex flex-col items-center gap-3 flex-1">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-muted flex items-center justify-center overflow-hidden border border-border">
              <Image src={partido.logoVisitante || "/placeholder.svg"} alt={partido.equipoVisitante} width={72} height={72} className="object-contain" />
            </div>
            <span className="font-bold text-center text-sm sm:text-base leading-tight">{partido.equipoVisitante}</span>
            <span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded">Visitante</span>
          </div>
        </div>
      </div>

      <div className="px-6 py-3 border-t border-border bg-muted/20 flex items-center justify-center gap-6 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><Trophy className="h-3.5 w-3.5" />{partido.estadio}</span>
      </div>
    </div>
  );
}
