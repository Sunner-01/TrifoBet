// components/profile/tabs/BetsTab.jsx
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Activity, Calendar, FileText } from "lucide-react";
import { useBetHistoryLogic } from "../hooks/useBetHistoryLogic";

export function BetsTab() {
  const {
    apuestasDeportivas,
    apuestasCasino,
    isLoadingApuestas,
    betsTabType,
    setBetsTabType,
    fetchApuestas
  } = useBetHistoryLogic();

  useEffect(() => {
    fetchApuestas();
  }, [fetchApuestas]);

  const getBetStatusBadge = (status) => {
    const s = status?.toLowerCase();
    if (s === "won" || s === "ganada") return <Badge className="bg-green-100 text-green-800">Ganada</Badge>;
    if (s === "lost" || s === "perdida") return <Badge className="bg-red-100 text-red-800">Perdida</Badge>;
    if (s === "pending" || s === "pendiente") return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
    return <Badge variant="secondary">Cancelada</Badge>;
  };

  return (
    <div className="p-1 pb-6">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-600" /> Historial de Apuestas
        </h3>
        <div className="flex bg-muted/50 p-1 rounded-lg">
          <Button variant={betsTabType === "deportivas" ? "default" : "ghost"} size="sm" onClick={() => setBetsTabType("deportivas")} className="w-32">Deportivas</Button>
          <Button variant={betsTabType === "casino" ? "default" : "ghost"} size="sm" onClick={() => setBetsTabType("casino")} className="w-32">Casino</Button>
        </div>
      </div>

      {isLoadingApuestas ? (
        <div className="flex justify-center p-8"><Activity className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="space-y-4">
          {betsTabType === "deportivas" && (
            apuestasDeportivas.length === 0 ? (
              <p className="text-center text-muted-foreground p-8">No tienes apuestas deportivas registradas.</p>
            ) : (
              apuestasDeportivas.map((bet) => (
                <Card key={bet.id} className="rounded-lg border shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline"><FileText className="h-3 w-3 mr-1"/>#{bet.id}</Badge>
                          <Badge variant="outline"><Calendar className="h-3 w-3 mr-1"/>{new Date(bet.fechaCreacion).toLocaleString()}</Badge>
                          {getBetStatusBadge(bet.estado)}
                        </div>
                        <h4 className="font-semibold text-lg">{bet.tipo}</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div><span className="text-muted-foreground">Inversión: </span> Bs {bet.monto}</div>
                          <div><span className="text-muted-foreground">Potencial: </span> Bs {bet.gananciaPotencial}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )
          )}

          {betsTabType === "casino" && (
            apuestasCasino.length === 0 ? (
              <p className="text-center text-muted-foreground p-8">No tienes historial de casino registrado.</p>
            ) : (
              apuestasCasino.map((bet) => (
                <Card key={bet.id} className="rounded-lg border shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold capitalize">{bet.game_type?.replace(/_/g, ' ')}</h4>
                        <p className="text-sm text-muted-foreground">Fecha: {new Date(bet.created_at).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${bet.profit > 0 ? "text-green-600" : "text-red-600"}`}>
                          {bet.profit > 0 ? `+Bs ${bet.profit}` : `-Bs ${bet.bet}`}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )
          )}
        </div>
      )}
    </div>
  );
}
