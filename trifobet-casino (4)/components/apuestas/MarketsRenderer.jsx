import { useState } from "react";
import { ChevronDown, ChevronUp, Target, Shield, TrendingUp, Trophy, Clock, Star, Flag, AlertCircle } from "lucide-react";

export function OddsButton({ label, sublabel, odds, selected, onClick }) {
  if (!odds || odds === "-") return null;
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-2.5 border transition-all duration-200 font-medium w-full
        ${selected
          ? "bg-primary border-primary text-primary-foreground shadow-sm shadow-primary/25 scale-[1.02]"
          : "bg-secondary/40 border-border/60 shadow-sm hover:border-primary/50 hover:bg-secondary/80 text-foreground"
        }`}
    >
      {sublabel && <span className="text-[9px] uppercase tracking-wide opacity-60 font-medium">{sublabel}</span>}
      <span className="text-[11px] font-medium opacity-75">{label}</span>
      <span className="text-base font-bold">{odds}</span>
    </button>
  );
}

export function MarketSection({ title, icon: Icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-muted/30 border-b border-border hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          {Icon && <Icon className="h-4 w-4 text-primary" />}
          <span className="text-sm font-semibold">{title}</span>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && <div className="p-5">{children}</div>}
    </div>
  );
}

export function MarketsRenderer({ activeTab, mercados, isBetSelected, handleBetSelection }) {
  switch (activeTab) {
    case "resultado":
      return (
        <div className="space-y-4">
          <MarketSection title="Resultado Final" icon={Target}>
            {mercados.resultado.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {mercados.resultado.map((bet) => (
                  <OddsButton
                    key={bet.type} label={bet.name} odds={bet.odds}
                    selected={isBetSelected("resultado", bet.type)}
                    onClick={() => handleBetSelection("resultado", bet)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Sin cuotas disponibles</p>
            )}
          </MarketSection>

          {mercados.empateNoValido.length > 0 && (
            <MarketSection title="Empate No Válido" icon={Shield}>
              <div className="grid grid-cols-2 gap-3">
                {mercados.empateNoValido.map((bet) => (
                  <OddsButton
                    key={bet.type} label={bet.name} odds={bet.odds}
                    selected={isBetSelected("resultado", bet.type)}
                    onClick={() => handleBetSelection("resultado", bet)}
                  />
                ))}
              </div>
            </MarketSection>
          )}

          {mercados.dobleOportunidad.length > 0 && (
            <MarketSection title="Doble Oportunidad" icon={Shield}>
              <div className="grid grid-cols-3 gap-3">
                {mercados.dobleOportunidad.map((bet) => (
                  <OddsButton
                    key={bet.type} label={bet.name} odds={bet.odds}
                    selected={isBetSelected("doble", bet.type)}
                    onClick={() => handleBetSelection("doble", bet)}
                  />
                ))}
              </div>
            </MarketSection>
          )}
        </div>
      );

    case "goles":
      return (
        <div className="space-y-4">
          <MarketSection title="Total de Goles" icon={TrendingUp}>
            {mercados.totalGoles.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {mercados.totalGoles.map((bet) => (
                  <OddsButton
                    key={bet.type} label={bet.name} sublabel={bet.sublabel} odds={bet.odds}
                    selected={isBetSelected("goles", bet.type)}
                    onClick={() => handleBetSelection("goles", bet)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Sin cuotas disponibles</p>
            )}
          </MarketSection>

          {mercados.golesLocal.length > 0 && (
            <MarketSection title="Total de Goles - Local" icon={Target}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {mercados.golesLocal.map((bet) => (
                  <OddsButton
                    key={bet.type} label={bet.name} sublabel={bet.sublabel} odds={bet.odds}
                    selected={isBetSelected("goles", bet.type)}
                    onClick={() => handleBetSelection("goles", bet)}
                  />
                ))}
              </div>
            </MarketSection>
          )}

          {mercados.golesVisitante.length > 0 && (
            <MarketSection title="Total de Goles - Visitante" icon={Target}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {mercados.golesVisitante.map((bet) => (
                  <OddsButton
                    key={bet.type} label={bet.name} sublabel={bet.sublabel} odds={bet.odds}
                    selected={isBetSelected("goles", bet.type)}
                    onClick={() => handleBetSelection("goles", bet)}
                  />
                ))}
              </div>
            </MarketSection>
          )}

          {mercados.parImpar.length > 0 && (
            <MarketSection title="Total de Goles - Par/Impar" icon={Star}>
              <div className="grid grid-cols-2 gap-3">
                {mercados.parImpar.map((bet) => (
                  <OddsButton
                    key={bet.type} label={bet.name} odds={bet.odds}
                    selected={isBetSelected("goles", bet.type)}
                    onClick={() => handleBetSelection("goles", bet)}
                  />
                ))}
              </div>
            </MarketSection>
          )}
        </div>
      );

    case "ambos":
      return (
        <MarketSection title="Ambos Equipos Marcan" icon={Trophy}>
          {mercados.ambosMarcan.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 max-w-xs">
              {mercados.ambosMarcan.map((bet) => (
                <OddsButton
                  key={bet.type} label={bet.name} odds={bet.odds}
                  selected={isBetSelected("ambos", bet.type)}
                  onClick={() => handleBetSelection("ambos", bet)}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">Sin cuotas disponibles</p>
          )}
        </MarketSection>
      );

    case "handicap":
      return (
        <div className="space-y-4">
          <MarketSection title="Handicap Europeo" icon={TrendingUp}>
            {mercados.handicap.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {mercados.handicap.map((bet) => (
                  <OddsButton
                    key={bet.type} label={bet.name} odds={bet.odds}
                    selected={isBetSelected("handicap", bet.type)}
                    onClick={() => handleBetSelection("handicap", bet)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Sin cuotas disponibles para este mercado</p>
            )}
          </MarketSection>

          {mercados.handicapsAsiaticos?.length > 0 && (
            <MarketSection title="Handicap Asiático" icon={TrendingUp}>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                {mercados.handicapsAsiaticos.map((bet) => (
                  <OddsButton
                    key={bet.type} label={bet.name} sublabel={bet.sublabel} odds={bet.odds}
                    selected={isBetSelected("handicap", bet.type)}
                    onClick={() => handleBetSelection("handicap", bet)}
                  />
                ))}
              </div>
            </MarketSection>
          )}
        </div>
      );

    case "tiempo":
      return (
        <div className="space-y-4">
          <MarketSection title="Resultado 1er Tiempo" icon={Clock}>
            {mercados.mitadTiempo.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {mercados.mitadTiempo.map((bet) => (
                  <OddsButton
                    key={bet.type} label={bet.name} odds={bet.odds}
                    selected={isBetSelected("tiempo", bet.type)}
                    onClick={() => handleBetSelection("tiempo", bet)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Sin cuotas disponibles para este mercado</p>
            )}
          </MarketSection>

          {mercados.golesMitades?.length > 0 && (
            <MarketSection title="Total de Goles - 1er Tiempo" icon={TrendingUp}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {mercados.golesMitades.map((bet) => (
                  <OddsButton
                    key={bet.type} label={bet.name} sublabel={bet.sublabel} odds={bet.odds}
                    selected={isBetSelected("tiempo", bet.type)}
                    onClick={() => handleBetSelection("tiempo", bet)}
                  />
                ))}
              </div>
            </MarketSection>
          )}

          {mercados.mitadMasGoles?.length > 0 && (
            <MarketSection title="Mitad con más goles" icon={Trophy}>
              <div className="grid grid-cols-3 gap-3">
                {mercados.mitadMasGoles.map((bet) => (
                  <OddsButton
                    key={bet.type} label={bet.name} odds={bet.odds}
                    selected={isBetSelected("tiempo", bet.type)}
                    onClick={() => handleBetSelection("tiempo", bet)}
                  />
                ))}
              </div>
            </MarketSection>
          )}
        </div>
      );

    case "exacto":
      return (
        <MarketSection title="Resultado Exacto" icon={Star}>
          {mercados.resultadoExacto.length > 0 ? (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {mercados.resultadoExacto.map((bet) => (
                <OddsButton
                  key={bet.type} label={bet.name} odds={bet.odds}
                  selected={isBetSelected("exacto", bet.type)}
                  onClick={() => handleBetSelection("exacto", bet)}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">Sin cuotas disponibles para este mercado</p>
          )}
        </MarketSection>
      );

    case "corners":
      return (
        <MarketSection title="Corners" icon={Flag}>
          {mercados.corners.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {mercados.corners.map((bet) => (
                <OddsButton
                  key={bet.type} label={bet.name} odds={bet.odds}
                  selected={isBetSelected("corners", bet.type)}
                  onClick={() => handleBetSelection("corners", bet)}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">Sin cuotas disponibles para este mercado</p>
          )}
        </MarketSection>
      );

    case "tarjetas":
      return (
        <MarketSection title="Tarjetas" icon={AlertCircle}>
          {mercados.tarjetas.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {mercados.tarjetas.map((bet) => (
                <OddsButton
                  key={bet.type} label={bet.name} odds={bet.odds}
                  selected={isBetSelected("tarjetas", bet.type)}
                  onClick={() => handleBetSelection("tarjetas", bet)}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">Sin cuotas disponibles para este mercado</p>
          )}
        </MarketSection>
      );

    case "especiales":
      return (
        <MarketSection title="Mercados Especiales" icon={Star}>
          {mercados.especiales?.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {mercados.especiales.map((bet) => (
                <OddsButton
                  key={bet.type} label={bet.name} odds={bet.odds}
                  selected={isBetSelected("especiales", bet.type)}
                  onClick={() => handleBetSelection("especiales", bet)}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">Sin cuotas especiales disponibles para este evento</p>
          )}
        </MarketSection>
      );

    default:
      return null;
  }
}
