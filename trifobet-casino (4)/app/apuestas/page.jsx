"use client"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Filter, TrendingUp, Zap } from "lucide-react"
import BetSlip from "@/components/bet-slip"
import { LiveChat } from "@/components/live-chat"

// Clean Code: Lógica extraída a un Custom Hook (SRP)
import { useApuestas } from "@/hooks/useApuestas"
// Clean Code: Componentes extraídos para no ensuciar la vista principal
import { MatchCard } from "@/components/apuestas/MatchCard"
import { SidebarApuestas } from "@/components/apuestas/SidebarApuestas"

export default function ApuestasPage() {
  const {
    searchQuery, setSearchQuery,
    selectedCountry, setSelectedCountry,
    selectedLeague, setSelectedLeague,
    showBetSlip, setShowBetSlip,
    selectedBets, setSelectedBets,
    loading, filteredPartidos,
    handleBetSelection, isBetSelected, removeBet
  } = useApuestas();

  return (
    <div className="w-full px-4 md:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Apuestas Deportivas</h1>
        <Badge className="bg-green-500 text-white">
          <Zap className="h-3 w-3 mr-1" />
          {filteredPartidos.length} eventos en vivo
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar Component */}
        <SidebarApuestas 
          selectedCountry={selectedCountry}
          setSelectedCountry={setSelectedCountry}
          selectedLeague={selectedLeague}
          setSelectedLeague={setSelectedLeague}
        />

        {/* Main Content */}
        <div className="lg:col-span-6 xl:col-span-6 space-y-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar equipos, ligas o competiciones..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon" className="shrink-0">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>

              <Tabs defaultValue="todos">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="todos">Todos</TabsTrigger>
                  <TabsTrigger value="hoy">Hoy</TabsTrigger>
                  <TabsTrigger value="directo">En Directo</TabsTrigger>
                  <TabsTrigger value="destacados">Destacados</TabsTrigger>
                </TabsList>

                <TabsContent value="todos" className="mt-6">
                  <div className="space-y-4">
                    {filteredPartidos.map((partido) => (
                      <MatchCard
                        key={partido.id}
                        partido={partido}
                        onBet={handleBetSelection}
                        isBetSelected={isBetSelected}
                      />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="hoy" className="mt-6">
                  <div className="space-y-4">
                    {filteredPartidos
                      .filter((partido) => partido.fecha.includes("Hoy") || partido.fecha.includes("hoy"))
                      .map((partido) => (
                        <MatchCard
                          key={partido.id}
                          partido={partido}
                          onBet={handleBetSelection}
                          isBetSelected={isBetSelected}
                        />
                      ))}
                  </div>
                </TabsContent>

                <TabsContent value="directo" className="mt-6">
                  <div className="space-y-4">
                    {filteredPartidos
                      .filter((partido) => partido.live)
                      .map((partido) => (
                        <MatchCard
                          key={partido.id}
                          partido={partido}
                          onBet={handleBetSelection}
                          isBetSelected={isBetSelected}
                        />
                      ))}
                  </div>
                </TabsContent>

                <TabsContent value="destacados" className="mt-6">
                  <div className="space-y-4">
                    {filteredPartidos
                      .filter((partido) => partido.destacado)
                      .map((partido) => (
                        <MatchCard
                          key={partido.id}
                          partido={partido}
                          onBet={handleBetSelection}
                          isBetSelected={isBetSelected}
                        />
                      ))}
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>

        {/* Right Sidebar - Live Chat */}
        <div className="lg:col-span-3 xl:col-span-3 hidden lg:block">
          <LiveChat />
        </div>
      </div>

      {/* Bet Slip */}
      <BetSlip
        open={showBetSlip}
        onOpenChange={setShowBetSlip}
        bets={selectedBets}
        onRemoveBet={removeBet}
        onClearAll={() => setSelectedBets([])}
      />
    </div>
  )
}