import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BetSlip({ open, onOpenChange, bets, onRemoveBet }) {
  return (
    <Card className={`fixed bottom-4 right-4 w-80 ${open ? "block" : "hidden"} shadow-lg`}>
      <CardHeader>
        <CardTitle>Boleto de Apuestas</CardTitle>
      </CardHeader>
      <CardContent>
        {bets.length === 0 ? (
          <p className="text-muted-foreground">No hay apuestas seleccionadas</p>
        ) : (
          bets.map((bet) => (
            <div key={`${bet.id}-${bet.type}-${bet.marketType}`} className="flex justify-between items-center mb-2">
              <div>
                <p className="font-medium">{bet.match}</p>
                <p className="text-sm text-muted-foreground">{bet.selection}</p>
                <p className="text-sm">Cuota: {bet.odds}</p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onRemoveBet(bet.id, bet.type, bet.marketType)}
              >
                X
              </Button>
            </div>
          ))
        )}
        <Button className="w-full mt-4" disabled={bets.length === 0}>
          Realizar Apuesta
        </Button>
      </CardContent>
    </Card>
  );
}