"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Clock,
  Search,
  Star,
  Filter,
  TrendingUp,
  Play,
  Users,
  Target,
  Trophy,
  Zap,
  ChevronRight,
  Globe,
  ArrowLeft,
  Loader2,
  History,
} from "lucide-react"
import BetSlip from "@/components/bet-slip"
import { LiveChat } from "@/components/live-chat"
import BetHistory from "@/components/bet-history"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import Image from "next/image"
import { apiGet } from "@/lib/api"

export default function FutbolPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCountry, setSelectedCountry] = useState("todos")
  const [selectedLeague, setSelectedLeague] = useState("todas")
  const [showBetSlip, setShowBetSlip] = useState(false)
  const [selectedBets, setSelectedBets] = useState([])
  const [partidos, setPartidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showMoreLeagues, setShowMoreLeagues] = useState(false)
  const [expandedCountries, setExpandedCountries] = useState(new Set())
  const [historyOpen, setHistoryOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const handleLoadBets = (e) => {
      if (e.detail?.bets) {
        setSelectedBets(e.detail.bets)
        setShowBetSlip(true)
      }
    }
    const handleOpenHistory = () => setHistoryOpen(true)
    
    window.addEventListener("load-bets", handleLoadBets)
    window.addEventListener("open-bet-history", handleOpenHistory)
    return () => {
      window.removeEventListener("load-bets", handleLoadBets)
      window.removeEventListener("open-bet-history", handleOpenHistory)
    }
  }, [])

  // Lista de prioridad estricta definida por el usuario
  const PRIORIDAD_LIGAS = [
    { id: 1, terms: ['copa del mundo', 'world cup'], pais: null },
    { id: 2, terms: ['champions league', 'uefa champions'], pais: null },
    { id: 3, terms: ['liga boliviana', 'primera división', 'primera division'], pais: ['bolivia'] },
    { id: 4, terms: ['copa américa', 'copa america'], pais: null },
    { id: 5, terms: ['libertadores', 'copa libertadores'], pais: null },
    { id: 6, terms: ['europa league', 'uefa europa'], pais: null },
    { id: 7, terms: ['laliga', 'la liga'], pais: ['españa', 'spain'] },
    { id: 8, terms: ['premier league'], pais: ['inglaterra', 'england'] },
    { id: 9, terms: ['serie a'], pais: ['italia', 'italy'] },
    { id: 10, terms: ['bundesliga'], pais: ['alemania', 'germany'] },
    { id: 11, terms: ['ligue 1'], pais: ['francia', 'france'] },
    { id: 12, terms: ['mls', 'major league soccer'], pais: ['estados unidos', 'usa'] },
    { id: 13, terms: ['copa confederaciones'], pais: null },
    { id: 14, terms: ['supercopa de europa', 'uefa super cup'], pais: null },
    { id: 15, terms: ['fa cup'], pais: ['inglaterra', 'england'] },
    { id: 16, terms: ['copa del rey'], pais: ['españa', 'spain'] },
    { id: 17, terms: ['coppa italia', 'copa de italia'], pais: ['italia', 'italy'] },
    { id: 18, terms: ['superliga argentina', 'liga profesional'], pais: ['argentina'] },
    { id: 19, terms: ['brasileirão', 'campeonato brasileiro', 'serie a'], pais: ['brasil', 'brazil'] },
    { id: 20, terms: ['copa mx'], pais: ['méxico', 'mexico'] },
    { id: 21, terms: ['primeira liga'], pais: ['portugal'] },
    { id: 22, terms: ['eredivisie'], pais: ['países bajos', 'holanda', 'netherlands'] },
    { id: 23, terms: ['j1 league', 'j-league'], pais: ['japón', 'japan'] },
    { id: 24, terms: ['a-league'], pais: ['australia'] },
    { id: 25, terms: ['chinese super league'], pais: ['china'] },
  ];

  // Función para determinar prioridad de liga (menor número = mayor prioridad)
  const obtenerPrioridadLiga = (nombreLiga, nombrePais) => {
    const liga = nombreLiga?.toLowerCase() || "";
    const pais = nombrePais?.toLowerCase() || "";

    for (const regla of PRIORIDAD_LIGAS) {
      // Verificar si el nombre de la liga coincide con alguno de los términos
      const ligaMatch = regla.terms.some(term => liga.includes(term));

      if (ligaMatch) {
        // Si la regla tiene restricción de país, verificarlo
        if (regla.pais) {
          const paisMatch = regla.pais.some(p => pais.includes(p));
          if (paisMatch) return regla.id;
        } else {
          // Si no tiene restricción de país, es match válido
          return regla.id;
        }
      }
    }
    return 999; // Default para ligas no listadas
  };

  // Función para capitalizar palabras
  const capitalizeTitle = (str) => {
    if (!str) return "";
    return str.toLowerCase().replace(/(?:^|\s|["'([{])+\S/g, match => match.toUpperCase());
  };

  // Calcular países únicos dinámicamente desde los partidos cargados
  const paisesUnicos = useMemo(() => {
    const paisMap = new Map();
    paisMap.set("todos", {
      id: "todos",
      name: "Todos los países",
      flag: "🌍",
      count: partidos.length
    });

    partidos.forEach(p => {
      const paisId = p.pais?.toLowerCase() || "world";
      if (paisMap.has(paisId)) {
        paisMap.get(paisId).count++;
      } else {
        paisMap.set(paisId, {
          id: paisId,
          name: capitalizeTitle(p.pais) || "World",
          flag: paisId === "world" ? "🌍" : "🏴",
          count: 1
        });
      }
    });

    return Array.from(paisMap.values()).sort((a, b) => {
      if (a.id === "todos") return -1;
      if (b.id === "todos") return 1;
      // Orden alfabético por nombre
      return a.name.localeCompare(b.name, 'es');
    });
  }, [partidos]);

  // Calcular ligas únicas dinámicamente con logos reales
  const ligasUnicas = useMemo(() => {
    const ligaMap = new Map();
    ligaMap.set("todas", {
      id: "todas",
      name: "Todas las ligas",
      country: "Todos",
      logo: null,
      count: partidos.length,
      tier: 0
    });

    partidos.forEach(p => {
      // Fix: Crear ID único combinando país y liga para evitar colisiones (ej: "primera-division" en varios países)
      const paisSlug = p.pais?.toLowerCase().replace(/\s+/g, '-') || "world";
      const ligaSlug = p.liga?.toLowerCase().replace(/\s+/g, '-') || "unknown";
      const ligaId = `${paisSlug}-${ligaSlug}`;

      if (ligaMap.has(ligaId)) {
        ligaMap.get(ligaId).count++;
      } else {
        ligaMap.set(ligaId, {
          id: ligaId,
          name: p.liga || "Liga",
          country: capitalizeTitle(p.pais) || "World",
          logo: p.logoLiga || null,
          count: 1,
          tier: p.liga?.toLowerCase().includes('champions') || p.liga?.toLowerCase().includes('europa') ? 1 : 2
        });
      }
    });

    return Array.from(ligaMap.values()).sort((a, b) => {
      if (a.id === "todas") return -1;
      if (b.id === "todas") return 1;
      const prioridadA = obtenerPrioridadLiga(a.name, a.country);
      const prioridadB = obtenerPrioridadLiga(b.name, b.country);
      if (prioridadA !== prioridadB) return prioridadA - prioridadB;
      return b.count - a.count;
    });
  }, [partidos]);

  // Calcular países únicos con banderas reales y sus competiciones
  const paisesConLigas = useMemo(() => {
    const paisMap = new Map();

    partidos.forEach(p => {
      const paisId = p.pais?.toLowerCase() || "world";
      const paisNombre = paisId === "world" ? "Mundo" : (capitalizeTitle(p.pais) || "Mundo");
      // Fix: Usar mismo ID compuesto que en ligasUnicas
      const paisSlug = p.pais?.toLowerCase().replace(/\s+/g, '-') || "world";
      const ligaSlug = p.liga?.toLowerCase().replace(/\s+/g, '-') || "unknown";
      const ligaId = `${paisSlug}-${ligaSlug}`;

      if (!paisMap.has(paisId)) {
        paisMap.set(paisId, {
          id: paisId,
          name: paisNombre,
          flag: p.banderaPais || null,
          count: 0,
          ligas: new Map()
        });
      }

      const pais = paisMap.get(paisId);
      pais.count++;

      // Agregar liga a este país
      if (!pais.ligas.has(ligaId)) {
        pais.ligas.set(ligaId, {
          id: ligaId,
          name: p.liga || "Liga",
          logo: p.logoLiga || null,
          count: 0
        });
      }
      pais.ligas.get(ligaId).count++;
    });

    // Convertir Map de ligas a Array
    const paisesArray = Array.from(paisMap.values()).map(pais => ({
      ...pais,
      ligas: Array.from(pais.ligas.values()).sort((a, b) => b.count - a.count)
    }));

    return paisesArray.sort((a, b) => {
      // Mundo siempre primero
      if (a.id === "world") return -1;
      if (b.id === "world") return 1;
      // Orden alfabético por nombre
      return a.name.localeCompare(b.name, 'es');
    });
  }, [partidos]);

  const formatearFecha = (fechaRaw) => {
    try {
      const fecha = new Date(fechaRaw);
      if (isNaN(fecha.getTime())) return String(fechaRaw);

      const hoy = new Date();
      const manana = new Date();
      manana.setDate(hoy.getDate() + 1);

      const hora = fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

      const isHoy = fecha.getDate() === hoy.getDate() && fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear();
      const isManana = fecha.getDate() === manana.getDate() && fecha.getMonth() === manana.getMonth() && fecha.getFullYear() === manana.getFullYear();

      if (isHoy) {
        return hora;
      } else if (isManana) {
        return `Mañana, ${hora}`;
      } else {
        return `${fecha.getDate()}/${fecha.getMonth() + 1}, ${hora}`;
      }
    } catch {
      return String(fechaRaw);
    }
  };



  // Función para mapear partidos del backend a estructura del frontend
  const mapPartidoFromBackend = (partido) => ({
    id: partido.id,
    deporte: "futbol",
    liga: partido.liga,
    pais: partido.pais?.toLowerCase() || "world",
    equipoLocal: partido.equipo_local,
    equipoVisitante: partido.equipo_visitante,
    logoLocal: partido.escudo_local,
    logoVisitante: partido.escudo_visitante,
    logoLiga: partido.logo_liga,
    banderaPais: partido.bandera_pais,
    fecha: formatearFecha(partido.fecha),
    cuotaLocal: partido.cuotas?.main?.["1X2"]?.["1"]?.toFixed(2) || "0.00",
    cuotaEmpate: partido.cuotas?.main?.["1X2"]?.["X"]?.toFixed(2) || "0.00",
    cuotaVisitante: partido.cuotas?.main?.["1X2"]?.["2"]?.toFixed(2) || "0.00",
    overUnder: {
      over: partido.cuotas?.goals?.total?.["2.5"]?.over?.toFixed(2) || "0.00",
      under: partido.cuotas?.goals?.total?.["2.5"]?.under?.toFixed(2) || "0.00",
      line: "2.5"
    },
    live: partido.estado !== "NS",
    marcadorLocal: partido.goles_local || 0,
    marcadorVisitante: partido.goles_visitante || 0,
    minuto: partido.minuto || null,
    estado: partido.estado,
    destacado: false,
    mercados: 80,
  });

  // Cargar partidos desde el backend
  useEffect(() => {
    const cargarPartidos = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔄 Cargando partidos desde /deportes/futbol/partidos');
        const data = await apiGet('/deportes/futbol/partidos');
        console.log('✅ Respuesta recibida:', data);
        console.log('📊 Tipo:', typeof data, '| Es array:', Array.isArray(data));

        let todosLosPartidos = [];

        // Caso 1: La API devuelve un objeto agrupado por fecha {"2025-12-09": [...], "2025-12-10": [...]}
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          console.log('📅 Detectado: OBJETO agrupado por fecha');
          console.log('📅 Fechas disponibles:', Object.keys(data));

          // Aplanar todos los partidos de todas las fechas
          Object.entries(data).forEach(([fecha, partidosPorFecha]) => {
            if (Array.isArray(partidosPorFecha)) {
              console.log(`  ➕ Fecha ${fecha}: ${partidosPorFecha.length} partidos`);
              todosLosPartidos = todosLosPartidos.concat(partidosPorFecha);
            }
          });

          console.log(`✅ Total de partidos extraídos: ${todosLosPartidos.length}`);
        }
        // Caso 2: La API devuelve array plano (fallback)
        else if (Array.isArray(data)) {
          console.log('📊 Detectado: ARRAY plano');
          todosLosPartidos = data;
        }

        if (todosLosPartidos.length > 0) {
          const partidosMapeados = todosLosPartidos.map(mapPartidoFromBackend);
          console.log('✅ Partidos mapeados:', partidosMapeados.length);
          setPartidos(partidosMapeados);
        } else {
          setPartidos([]);
        }
      } catch (error) {
        console.error('Error al cargar partidos:', error);
        setError(error.message || 'No se pudieron cargar los partidos');
        setPartidos([]);
        toast({
          title: "Error",
          description: "No se pudieron cargar los partidos. Intenta recargar la página.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    cargarPartidos();
  }, []);

  const handleBetSelection = (match, type, odds, marketType = "1x2") => {
    const betId = `${match.id}-${type}-${marketType}`
    
    // Buscar si ya hay una apuesta para este partido y mercado
    const existingBetIndex = selectedBets.findIndex(
      (bet) => bet.id === match.id && bet.marketType === marketType,
    )

    if (existingBetIndex >= 0) {
      const existingBet = selectedBets[existingBetIndex]
      const newBets = [...selectedBets]

      if (existingBet.type === type) {
        // Si hizo clic en la misma, la quita
        newBets.splice(existingBetIndex, 1)
        setSelectedBets(newBets)
        toast({
          title: "Apuesta eliminada",
          description: `${match.equipoLocal} vs ${match.equipoVisitante} - ${type}`,
        })
      } else {
        // Si hizo clic en otra, la reemplaza
        const seleccionLabel = type === "home" ? match.equipoLocal : type === "away" ? match.equipoVisitante : type === "draw" ? "Empate" : type
        newBets[existingBetIndex] = {
          id: match.id,
          match: `${match.equipoLocal} vs ${match.equipoVisitante}`,
          type: type,
          odds: odds,
          league: match.liga,
          selection: seleccionLabel,
          marketType: marketType,
        }
        setSelectedBets(newBets)
        setShowBetSlip(true)
        toast({
          title: "Selección actualizada",
          description: `${match.equipoLocal} vs ${match.equipoVisitante} - ${type}`,
        })
      }
    } else {
      const seleccionLabel = type === "home" ? match.equipoLocal : type === "away" ? match.equipoVisitante : type === "draw" ? "Empate" : type
      const newBet = {
        id: match.id,
        match: `${match.equipoLocal} vs ${match.equipoVisitante}`,
        type: type,
        odds: odds,
        league: match.liga,
        selection: seleccionLabel,
        marketType: marketType,
      }
      setSelectedBets([...selectedBets, newBet])
      setShowBetSlip(true)
      toast({
        title: "Apuesta añadida",
        description: `${match.equipoLocal} vs ${match.equipoVisitante} - ${type}`,
      })
    }
  }

  const filteredPartidos = partidos.filter((partido) => {
    const matchesSearch =
      partido.equipoLocal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partido.equipoVisitante.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partido.liga.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCountry = selectedCountry === "todos" || partido.pais === selectedCountry

    // Fix: Comparar con ID compuesto (pais-liga)
    const paisSlug = partido.pais?.toLowerCase().replace(/\s+/g, '-') || "world";
    const ligaSlug = partido.liga?.toLowerCase().replace(/\s+/g, '-') || "unknown";
    const partidoLigaId = `${paisSlug}-${ligaSlug}`;

    const matchesLeague = selectedLeague === "todas" || partidoLigaId === selectedLeague;

    return matchesSearch && matchesCountry && matchesLeague
  }).sort((a, b) => {
    const prioridadA = obtenerPrioridadLiga(a.liga, a.pais);
    const prioridadB = obtenerPrioridadLiga(b.liga, b.pais);
    if (prioridadA !== prioridadB) return prioridadA - prioridadB;
    if (a.live !== b.live) return a.live ? -1 : 1;
    return 0;
  })

  const partidosDestacados = filteredPartidos.filter((p) => p.destacado)
  const partidosEnVivo = filteredPartidos.filter((p) => p.live)
  const partidosProximos = filteredPartidos.filter((p) => !p.live && !p.destacado)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header con navegación */}
      <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5 border-b sticky top-0 z-40 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/apuestas">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Fútbol</h1>
            </div>
            <div className="flex items-center gap-2">
              <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2" id="btn-historial-completo">
                    <History className="h-4 w-4" />
                    Mis Apuestas
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-md">
                  <SheetHeader>
                    <SheetTitle>Historial de Apuestas</SheetTitle>
                  </SheetHeader>
                  <BetHistory />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 md:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar Izquierdo - Filtros */}
          <div className="lg:col-span-3 xl:col-span-3 space-y-4 max-w-[280px]">
            {/* Búsqueda */}
            <Card className="border-2">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar equipos, ligas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Competiciones PRIMERO */}
            <Card className="border-2">
              <CardContent className="p-4">
                <h2 className="font-bold mb-4 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Competiciones
                </h2>
                <div className="space-y-1 max-h-96 overflow-y-auto">
                  {ligasUnicas.slice(0, showMoreLeagues ? ligasUnicas.length : 10).map((liga) => (
                    <Button
                      key={liga.id}
                      variant={selectedLeague === liga.id ? "default" : "ghost"}
                      className="w-full justify-between h-auto py-2"
                      onClick={() => setSelectedLeague(liga.id)}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {liga.logo ? (
                          <Image
                            src={liga.logo}
                            alt={liga.name}
                            width={20}
                            height={20}
                            className="object-contain flex-shrink-0"
                          />
                        ) : (
                          <Trophy className="h-4 w-4 flex-shrink-0" />
                        )}
                        <span className="text-xs truncate">{liga.name}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {liga.count}
                      </Badge>
                    </Button>
                  ))}
                </div>
                {ligasUnicas.length > 10 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => setShowMoreLeagues(!showMoreLeagues)}
                  >
                    {showMoreLeagues ? "Ver menos" : `Ver más (${ligasUnicas.length - 10})`}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Países SEGUNDO (accordion) */}
            <Card className="border-2">
              <CardContent className="p-4">
                <h2 className="font-bold mb-4 flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  Por País
                </h2>
                <div className="space-y-1">
                  {paisesConLigas.map((pais) => {
                    const isExpanded = expandedCountries.has(pais.id);
                    return (
                      <div key={pais.id} className="border rounded-lg overflow-hidden">
                        <Button
                          variant="ghost"
                          className="w-full justify-between h-auto py-2 rounded-none"
                          onClick={() => {
                            const newExpanded = new Set(expandedCountries);
                            if (isExpanded) {
                              newExpanded.delete(pais.id);
                            } else {
                              newExpanded.add(pais.id);
                            }
                            setExpandedCountries(newExpanded);
                          }}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {pais.flag ? (
                              <Image
                                src={pais.flag}
                                alt={pais.name}
                                width={20}
                                height={15}
                                className="object-cover rounded flex-shrink-0"
                              />
                            ) : (
                              <Globe className="h-4 w-4 flex-shrink-0" />
                            )}
                            <span className="text-sm font-semibold truncate">{pais.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {pais.count}
                            </Badge>
                            <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                          </div>
                        </Button>
                        {isExpanded && (
                          <div className="bg-muted/30 p-2 space-y-1">
                            {pais.ligas.map((liga) => (
                              <Button
                                key={`${pais.id}-${liga.id}`}
                                variant={selectedLeague === liga.id ? "default" : "ghost"}
                                size="sm"
                                className="w-full justify-between h-auto py-1.5"
                                onClick={() => setSelectedLeague(liga.id)}
                              >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  {liga.logo ? (
                                    <Image
                                      src={liga.logo}
                                      alt={liga.name}
                                      width={16}
                                      height={16}
                                      className="object-contain flex-shrink-0"
                                    />
                                  ) : (
                                    <div className="w-4 h-4 flex-shrink-0" />
                                  )}
                                  <span className="text-xs truncate">{liga.name}</span>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {liga.count}
                                </Badge>
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contenido Principal */}
          <div className="lg:col-span-6 xl:col-span-6 flex-1">
            <Tabs defaultValue="todos" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
                <TabsTrigger value="todos" className="gap-2">
                  <Trophy className="h-4 w-4" />
                  Todos ({filteredPartidos.length})
                </TabsTrigger>
                <TabsTrigger value="vivo" className="gap-2">
                  <Zap className="h-4 w-4" />
                  En Vivo ({partidosEnVivo.length})
                </TabsTrigger>
                <TabsTrigger value="proximos" className="gap-2">
                  <Clock className="h-4 w-4" />
                  Próximos ({partidosProximos.length})
                </TabsTrigger>
              </TabsList>

              {/* Loading state */}
              {loading && (
                <Card>
                  <CardContent className="p-12 flex flex-col items-center justify-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground">Cargando partidos...</p>
                  </CardContent>
                </Card>
              )}

              {/* Error state */}
              {error && !loading && (
                <Card className="border-destructive">
                  <CardContent className="p-8 text-center">
                    <p className="text-destructive font-semibold mb-2">Error al cargar partidos</p>
                    <p className="text-muted-foreground text-sm">{error}</p>
                    <Button
                      onClick={() => window.location.reload()}
                      className="mt-4"
                      variant="outline"
                    >
                      Recargar página
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Empty state */}
              {!loading && !error && partidos.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-semibold mb-2">No hay partidos disponibles</p>
                    <p className="text-muted-foreground">
                      No se encontraron partidos en este momento. Por favor, intenta más tarde.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Todos los partidos */}
              <TabsContent value="todos" className="space-y-4 mt-4">
                {filteredPartidos.map((partido) => (
                  <MatchCard
                    key={partido.id}
                    match={partido}
                    onBetSelect={handleBetSelection}
                    selectedBets={selectedBets}
                  />
                ))}
              </TabsContent>

              {/* En Vivo */}
              <TabsContent value="vivo" className="space-y-4 mt-4">
                {partidosEnVivo.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Zap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No hay partidos en vivo en este momento</p>
                    </CardContent>
                  </Card>
                ) : (
                  partidosEnVivo.map((partido) => (
                    <MatchCard
                      key={partido.id}
                      match={partido}
                      onBetSelect={handleBetSelection}
                      selectedBets={selectedBets}
                    />
                  ))
                )}
              </TabsContent>

              {/* Próximos */}
              <TabsContent value="proximos" className="space-y-4 mt-4">
                {partidosProximos.map((partido) => (
                  <MatchCard
                    key={partido.id}
                    match={partido}
                    onBetSelect={handleBetSelection}
                    selectedBets={selectedBets}
                  />
                ))}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar - Live Chat */}
          <div className="lg:col-span-3 xl:col-span-3 hidden lg:block">
            <LiveChat />
          </div>
        </div>
      </div>

      {/* BetSlip */}
      <BetSlip
        open={showBetSlip}
        onOpenChange={setShowBetSlip}
        bets={selectedBets}
        onRemoveBet={(id, type, marketType) => {
          setSelectedBets(selectedBets.filter(b => !(b.id === id && b.type === type && b.marketType === marketType)))
        }}
        onClearAll={() => setSelectedBets([])}
      />
    </div>
  )
}

// Componente para cada tarjeta de partido
function MatchCard({ match, onBetSelect, selectedBets }) {
  const isBetSelected = (type, marketType = "1x2") => {
    return selectedBets.some(
      (bet) => bet.id === match.id && bet.type === type && bet.marketType === marketType
    )
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow border-2">
      <CardContent className="p-0">
        {/* Header con liga */}
        <div className="bg-muted/50 px-4 py-2 flex items-center justify-between border-b">
          <div className="flex items-center gap-2">
            {match.logoLiga && (
              <Image
                src={match.logoLiga}
                alt={match.liga}
                width={20}
                height={20}
                className="object-contain"
              />
            )}
            <span className="text-sm font-semibold">{match.liga}</span>
          </div>
          <div className="flex items-center gap-2">
            {match.live && (
              <Badge variant="destructive" className="animate-pulse">
                <Play className="h-3 w-3 mr-1" />
                EN VIVO
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">{match.fecha}</span>
          </div>
        </div>

        {/* Equipos y marcador */}
        <div className="p-4">
          <div className="grid grid-cols-3 gap-4 items-center mb-4">
            {/* Equipo Local */}
            <div className="flex flex-col items-center text-center">
              {match.logoLocal && (
                <Image
                  src={match.logoLocal}
                  alt={match.equipoLocal}
                  width={48}
                  height={48}
                  className="mb-2 object-contain"
                />
              )}
              <span className="font-semibold text-sm">{match.equipoLocal}</span>
            </div>

            {/* Marcador / Hora */}
            <div className="text-center">
              {match.live ? (
                <div>
                  <div className="text-3xl font-bold">
                    {match.marcadorLocal} - {match.marcadorVisitante}
                  </div>
                  {match.minuto && (
                    <div className="text-xs text-green-600 font-semibold mt-1">
                      {match.minuto}'
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-2xl font-bold text-muted-foreground">
                  VS
                </div>
              )}
            </div>

            {/* Equipo Visitante */}
            <div className="flex flex-col items-center text-center">
              {match.logoVisitante && (
                <Image
                  src={match.logoVisitante}
                  alt={match.equipoVisitante}
                  width={48}
                  height={48}
                  className="mb-2 object-contain"
                />
              )}
              <span className="font-semibold text-sm">{match.equipoVisitante}</span>
            </div>
          </div>

          {/* Cuotas 1X2 */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <Button
              variant={isBetSelected("local") ? "default" : "outline"}
              className="flex flex-col h-auto py-3"
              onClick={() => onBetSelect(match, "local", match.cuotaLocal)}
            >
              <span className="text-xs text-muted-foreground mb-1">Local</span>
              <span className="text-lg font-bold">{match.cuotaLocal}</span>
            </Button>
            <Button
              variant={isBetSelected("empate") ? "default" : "outline"}
              className="flex flex-col h-auto py-3"
              onClick={() => onBetSelect(match, "empate", match.cuotaEmpate)}
            >
              <span className="text-xs text-muted-foreground mb-1">Empate</span>
              <span className="text-lg font-bold">{match.cuotaEmpate}</span>
            </Button>
            <Button
              variant={isBetSelected("visitante") ? "default" : "outline"}
              className="flex flex-col h-auto py-3"
              onClick={() => onBetSelect(match, "visitante", match.cuotaVisitante)}
            >
              <span className="text-xs text-muted-foreground mb-1">Visitante</span>
              <span className="text-lg font-bold">{match.cuotaVisitante}</span>
            </Button>
          </div>

          {/* Más mercados */}
          {match.overUnder && (
            <div className="mt-3 pt-3 border-t">
              <div className="text-xs text-muted-foreground mb-2">Más/Menos {match.overUnder.line} goles</div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={isBetSelected("over", "overunder") ? "default" : "outline"}
                  size="sm"
                  onClick={() => onBetSelect(match, "over", match.overUnder.over, "overunder")}
                >
                  Más {match.overUnder.over}
                </Button>
                <Button
                  variant={isBetSelected("under", "overunder") ? "default" : "outline"}
                  size="sm"
                  onClick={() => onBetSelect(match, "under", match.overUnder.under, "overunder")}
                >
                  Menos {match.overUnder.under}
                </Button>
              </div>

              {/* Link a página de detalles */}
              <Link href={`/apuestas/partido/${match.id}`} className="block mt-2">
                <Button variant="ghost" className="w-full" size="sm">
                  <Target className="h-4 w-4 mr-2" />
                  Ver todos los mercados ({match.mercados || 80})
                </Button>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}