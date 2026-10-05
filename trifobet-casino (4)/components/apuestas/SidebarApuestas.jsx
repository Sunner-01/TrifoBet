import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, Globe, Star, Target, Clock, Play, TrendingUp, ChevronRight } from "lucide-react"

export function SidebarApuestas({ selectedCountry, setSelectedCountry, selectedLeague, setSelectedLeague }) {
  const deportes = [
    { id: "futbol", name: "Fútbol", icon: "⚽", count: 1247, active: true },
    { id: "baloncesto", name: "Baloncesto", icon: "🏀", count: 432, active: true },
    { id: "tenis", name: "Tenis", icon: "🎾", count: 328, active: true },
    { id: "beisbol", name: "Béisbol", icon: "⚾", count: 218, active: true },
    { id: "hockey", name: "Hockey", icon: "🏒", count: 156, active: true },
    { id: "voleibol", name: "Voleibol", icon: "🏐", count: 89, active: true },
    { id: "futbol-americano", name: "Fútbol Americano", icon: "🏈", count: 167, active: true },
    { id: "rugby", name: "Rugby", icon: "🏉", count: 78, active: true },
    { id: "golf", name: "Golf", icon: "⛳", count: 45, active: true },
    { id: "boxeo", name: "Boxeo", icon: "🥊", count: 34, active: true },
    { id: "mma", name: "MMA", icon: "🥋", count: 28, active: true },
    { id: "formula1", name: "Fórmula 1", icon: "🏎️", count: 12, active: true },
    { id: "ciclismo", name: "Ciclismo", icon: "🚴", count: 23, active: true },
    { id: "esports", name: "eSports", icon: "🎮", count: 156, active: true },
    { id: "dardos", name: "Dardos", icon: "🎯", count: 19, active: true },
  ]

  const paises = [
    { id: "todos", name: "Todos los países", flag: "🌍", count: 2847 },
    { id: "espana", name: "España", flag: "🇪🇸", count: 234 },
    { id: "inglaterra", name: "Inglaterra", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", count: 198 },
    { id: "alemania", name: "Alemania", flag: "🇩🇪", count: 167 },
    { id: "italia", name: "Italia", flag: "🇮🇹", count: 145 },
    { id: "francia", name: "Francia", flag: "🇫🇷", count: 134 },
    { id: "brasil", name: "Brasil", flag: "🇧🇷", count: 123 },
    { id: "argentina", name: "Argentina", flag: "🇦🇷", count: 98 },
    { id: "usa", name: "Estados Unidos", flag: "🇺🇸", count: 287 },
    { id: "mexico", name: "México", flag: "🇲🇽", count: 76 },
    { id: "portugal", name: "Portugal", flag: "🇵🇹", count: 54 },
    { id: "holanda", name: "Países Bajos", flag: "🇳🇱", count: 43 },
    { id: "colombia", name: "Colombia", flag: "🇨🇴", count: 38 },
    { id: "chile", name: "Chile", flag: "🇨🇱", count: 29 },
    { id: "uruguay", name: "Uruguay", flag: "🇺🇾", count: 24 },
  ]

  const ligas = {
    futbol: [
      { id: "laliga", name: "LaLiga", country: "España", flag: "🇪🇸", count: 45, tier: 1 },
      { id: "premier", name: "Premier League", country: "Inglaterra", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", count: 38, tier: 1 },
      { id: "bundesliga", name: "Bundesliga", country: "Alemania", flag: "🇩🇪", count: 34, tier: 1 },
      { id: "seriea", name: "Serie A", country: "Italia", flag: "🇮🇹", count: 32, tier: 1 },
      { id: "ligue1", name: "Ligue 1", country: "Francia", flag: "🇫🇷", count: 28, tier: 1 },
      { id: "champions", name: "Champions League", country: "Europa", flag: "🇪🇺", count: 16, tier: 1 },
      { id: "europa", name: "Europa League", country: "Europa", flag: "🇪🇺", count: 24, tier: 2 },
      { id: "segunda", name: "Segunda División", country: "España", flag: "🇪🇸", count: 42, tier: 2 },
      { id: "championship", name: "Championship", country: "Inglaterra", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", count: 46, tier: 2 },
      { id: "brasileirao", name: "Brasileirão", country: "Brasil", flag: "🇧🇷", count: 38, tier: 1 },
      { id: "liga-mx", name: "Liga MX", country: "México", flag: "🇲🇽", count: 34, tier: 1 },
      { id: "mls", name: "MLS", country: "Estados Unidos", flag: "🇺🇸", count: 56, tier: 1 },
    ],
  }

  return (
    <div className="lg:col-span-3 xl:col-span-3 space-y-6 max-w-[280px]">
      {/* Deportes */}
      <Card className="border-2">
        <CardContent className="p-4">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Deportes
          </h2>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {deportes.map((deporte) => (
              <Link
                key={deporte.id}
                href={`/apuestas/${deporte.id}`}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{deporte.icon}</span>
                  <span className="text-sm font-medium group-hover:text-primary">{deporte.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="secondary" className="text-xs">
                    {deporte.count}
                  </Badge>
                  <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-primary" />
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Países */}
      <Card className="border-2">
        <CardContent className="p-4">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Países
          </h2>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {paises.map((pais) => (
              <Button
                key={pais.id}
                variant={selectedCountry === pais.id ? "default" : "ghost"}
                className="w-full justify-between h-auto py-2"
                onClick={() => setSelectedCountry(pais.id)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{pais.flag}</span>
                  <span className="text-xs">{pais.name}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {pais.count}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ligas */}
      <Card className="border-2">
        <CardContent className="p-4">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Ligas Principales
          </h2>
          <div className="space-y-2">
            <Button
              variant={selectedLeague === "todas" ? "default" : "ghost"}
              className="w-full justify-start text-xs"
              onClick={() => setSelectedLeague("todas")}
            >
              Todas las ligas
            </Button>
            {ligas.futbol?.slice(0, 8).map((liga) => (
              <Button
                key={liga.id}
                variant={selectedLeague === liga.name ? "default" : "ghost"}
                className="w-full justify-between h-auto py-2"
                onClick={() => setSelectedLeague(liga.name)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs">{liga.flag}</span>
                  <span className="text-xs">{liga.name}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {liga.count}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Apuestas Rápidas */}
      <Card className="border-2">
        <CardContent className="p-4">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Acceso Rápido
          </h2>
          <div className="space-y-2">
            <Button className="w-full justify-start" size="sm">
              <Clock className="h-4 w-4 mr-2" />
              Partidos de Hoy
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Star className="h-4 w-4 mr-2" />
              Favoritos
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Play className="h-4 w-4 mr-2" />
              En Vivo
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <TrendingUp className="h-4 w-4 mr-2" />
              Populares
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
