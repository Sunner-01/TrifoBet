"use client"

import Link from "next/link"
import { Trophy, ChevronRight } from "lucide-react"

export default function InfiniteMatchTicker({ matches }) {
  if (!matches || matches.length === 0) return null

  // Duplicamos la lista varias veces para asegurar que el scroll infinito se vea continuo
  // aunque haya pocos partidos destacados
  const duplicatedMatches = [...matches, ...matches, ...matches, ...matches, ...matches]

  return (
    <div 
      className="absolute bottom-12 left-0 right-0 z-20 w-full overflow-hidden flex whitespace-nowrap py-2" 
      style={{ maskImage: "linear-gradient(to right, transparent, black 2%, black 98%, transparent)" }}
    >
      <div className="flex animate-marquee hover:[animation-play-state:paused] w-max">
        {duplicatedMatches.map((match, idx) => (
          <Link 
            href={`/apuestas/partido/${match.id}`}
            key={`${match.id}-${idx}`} 
            className="inline-block mx-3 w-[360px] bg-[#1A1C1A]/95 backdrop-blur-md text-white rounded-xl overflow-hidden border border-[#2A2C2A]/80 shadow-2xl flex-shrink-0 hover:bg-[#202220] transition-colors"
          >
            {/* Header: Trophy and League */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-[#2A2C2A]/50 bg-[#1A1C1A]/80">
              <Trophy className="h-4 w-4 text-green-500" />
              <span className="text-xs font-bold tracking-wider text-gray-300 uppercase">{match.liga}</span>
            </div>
            
            {/* Body: Teams and Time */}
            <div className="py-2 px-4 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-lg overflow-hidden p-1">
                   {match.logoLocal?.includes('http') || match.logoLocal?.includes('/') ? <img src={match.logoLocal} alt="" className="w-full h-full object-contain" /> : <span className="text-xl">{match.logoLocal || "⚽"}</span>}
                </div>
                <span className="text-xs font-semibold truncate w-full text-center">{match.equipoLocal}</span>
              </div>

              <div className="flex flex-col items-center justify-center min-w-[60px]">
                <span className="text-[10px] font-bold text-gray-400">{match.fecha?.replace("Hoy, ", "") || "20:00"}</span>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">VS</span>
              </div>

              <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-lg overflow-hidden p-1">
                   {match.logoVisitante?.includes('http') || match.logoVisitante?.includes('/') ? <img src={match.logoVisitante} alt="" className="w-full h-full object-contain" /> : <span className="text-xl">{match.logoVisitante || "⚽"}</span>}
                </div>
                <span className="text-xs font-semibold truncate w-full text-center">{match.equipoVisitante}</span>
              </div>
            </div>

            {/* Odds */}
            <div className="px-4 pb-2 grid grid-cols-3 gap-2">
              <div className="bg-[#262826] hover:bg-[#303230] rounded-md py-1 flex flex-col items-center transition-colors">
                <span className="text-[9px] text-gray-400 font-bold">1</span>
                <span className="text-xs font-bold text-white">{match.cuotaLocal || "1.00"}</span>
              </div>
              <div className="bg-[#262826] hover:bg-[#303230] rounded-md py-1 flex flex-col items-center transition-colors">
                <span className="text-[9px] text-gray-400 font-bold">X</span>
                <span className="text-xs font-bold text-white">{match.cuotaEmpate || "1.00"}</span>
              </div>
              <div className="bg-[#262826] hover:bg-[#303230] rounded-md py-1 flex flex-col items-center transition-colors">
                <span className="text-[9px] text-gray-400 font-bold">2</span>
                <span className="text-xs font-bold text-white">{match.cuotaVisitante || "1.00"}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
