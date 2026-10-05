import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function BaloncestoPage() {
  const partidos = [
    {
      id: 1,
      liga: "NBA",
      equipoLocal: "Lakers",
      equipoVisitante: "Warriors",
      fecha: "Hoy, 22:00",
      cuotaLocal: "1.85",
      cuotaVisitante: "1.95",
      logoLocal: "🟡🟣",
      logoVisitante: "🔵🟡",
    },
    {
      id: 2,
      liga: "Euroliga",
      equipoLocal: "Real Madrid",
      equipoVisitante: "Barcelona",
      fecha: "Mañana, 20:30",
      cuotaLocal: "2.10",
      cuotaVisitante: "1.70",
      logoLocal: "⚪",
      logoVisitante: "🔵🔴",
    },
  ]

  return (
    <div className="container py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/apuestas">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <h1 className="text-3xl font-bold flex items-center gap-2">🏀 Apuestas de Baloncesto</h1>
      </div>

      <div className="grid gap-4">
        {partidos.map((partido) => (
          <Card key={partido.id} className="overflow-hidden border hover:border-primary/50 transition-all duration-300">
            <CardContent className="p-0">
              <div className="p-4 border-b bg-muted/30">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline" className="bg-primary/10 text-primary font-medium">
                    {partido.liga}
                  </Badge>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-1 h-4 w-4" />
                    {partido.fecha}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{partido.logoLocal}</span>
                    <span className="font-semibold text-lg">{partido.equipoLocal}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{partido.logoVisitante}</span>
                    <span className="font-semibold text-lg">{partido.equipoVisitante}</span>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <Button variant="outline" className="h-16 flex flex-col justify-center">
                    <span className="text-xs font-medium mb-1">1 - {partido.equipoLocal}</span>
                    <span className="text-lg font-bold">{partido.cuotaLocal}</span>
                  </Button>
                  <Button variant="outline" className="h-16 flex flex-col justify-center">
                    <span className="text-xs font-medium mb-1">2 - {partido.equipoVisitante}</span>
                    <span className="text-lg font-bold">{partido.cuotaVisitante}</span>
                  </Button>
                </div>
                <Button variant="outline" className="w-full h-12 border-dashed">
                  <Users className="h-4 w-4 mr-2" />
                  +85 mercados más
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}