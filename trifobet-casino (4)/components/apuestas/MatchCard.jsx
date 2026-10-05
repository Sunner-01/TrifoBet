import Image from "next/image"
import Link from "next/link"
import { Trophy, Radio, Clock, ChevronRight } from "lucide-react"

function OddsButton({ label, sublabel, odds, selected, onClick }) {
  if (!odds || odds === "-") return null
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-2 text-center transition-all duration-200 border font-medium
        ${selected
          ? "bg-primary border-primary text-primary-foreground shadow-sm scale-[1.02]"
          : "bg-secondary/40 border-border/60 hover:border-primary/50 hover:bg-secondary/80 text-foreground shadow-sm"
        }`}
    >
      <div className="flex items-center gap-1">
        <span className="text-[10px] font-bold opacity-60 uppercase">{label}</span>
        {sublabel && <span className="text-[9px] uppercase tracking-wide opacity-50">{sublabel}</span>}
      </div>
      <span className="text-sm font-black">{odds}</span>
    </button>
  )
}

export function MatchCard({ partido, onBet, isBetSelected }) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 flex flex-col">
      {/* Header - League */}
      <div className="px-4 py-2.5 flex items-center justify-between bg-muted/20 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Trophy className="h-3.5 w-3.5 text-primary/70" />
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{partido.liga}</span>
        </div>
        {partido.live && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
            <Radio className="h-2.5 w-2.5 animate-pulse" />
            EN VIVO
          </span>
        )}
      </div>

      {/* Main Teams & Score */}
      <div className="px-4 py-5 flex items-center justify-between gap-2">
        <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-muted shadow-sm">
            <Image src={partido.logoLocal || "/placeholder.svg"} alt={partido.equipoLocal} width={32} height={32} className="object-contain" />
          </div>
          <span className="font-bold text-sm text-center line-clamp-2 leading-tight">{partido.equipoLocal}</span>
        </div>

        <div className="flex flex-col items-center justify-center px-2 min-w-[80px]">
          <div className="text-[10px] font-bold text-muted-foreground mb-1.5 whitespace-nowrap bg-muted/50 px-2 py-0.5 rounded-full uppercase">
            {partido.live ? (
              <span className="text-red-500 flex items-center gap-1"><Clock className="h-2.5 w-2.5"/>{partido.tiempo}</span>
            ) : (
              <span>{partido.fecha}</span>
            )}
          </div>
          
          {partido.live ? (
            <span className="text-2xl font-black text-primary tabular-nums tracking-tighter">{partido.resultado}</span>
          ) : (
            <span className="text-sm font-black text-muted-foreground/50">VS</span>
          )}
        </div>

        <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-muted shadow-sm">
            <Image src={partido.logoVisitante || "/placeholder.svg"} alt={partido.equipoVisitante} width={32} height={32} className="object-contain" />
          </div>
          <span className="font-bold text-sm text-center line-clamp-2 leading-tight">{partido.equipoVisitante}</span>
        </div>
      </div>

      {/* Markets Section */}
      <div className="px-4 pb-4 mt-auto">
        <div className="grid grid-cols-3 gap-2">
          <OddsButton label="1" odds={partido.cuotaLocal} selected={isBetSelected(partido.id, "home", "1x2")} onClick={() => onBet(partido, "home", partido.cuotaLocal, "1x2")} />
          {partido.cuotaEmpate ? (
            <OddsButton label="X" odds={partido.cuotaEmpate} selected={isBetSelected(partido.id, "draw", "1x2")} onClick={() => onBet(partido, "draw", partido.cuotaEmpate, "1x2")} />
          ) : (
            <div />
          )}
          <OddsButton label="2" odds={partido.cuotaVisitante} selected={isBetSelected(partido.id, "away", "1x2")} onClick={() => onBet(partido, "away", partido.cuotaVisitante, "1x2")} />
        </div>

        <Link href={`/apuestas/partido/${partido.id}`} className="block mt-3">
          <div className="w-full text-center py-2 text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors border-t border-border/50 pt-3">
            +{partido.mercados || 50} MERCADOS DISPONIBLES <ChevronRight className="inline h-3 w-3 -mt-0.5" />
          </div>
        </Link>
      </div>
    </div>
  )
}
