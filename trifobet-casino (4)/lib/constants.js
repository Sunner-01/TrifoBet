// lib/constants.js
import { Trophy, Gift, Star } from "lucide-react";

export const slides = [
  {
    id: 1,
    title: "Bienvenido a TrifoBet",
    description: "El mejor casino online con las mejores apuestas deportivas, juegos y promociones exclusivas",
    image: "/port4.png?height=600&width=1200",
    cta: "Jugar Ahora",
  },
  {
    id: 2,
    title: "Apuestas Deportivas",
    description: "Apuesta en tus deportes favoritos con las mejores cuotas del mercado",
    image: "/port1.png?height=600&width=1200",
    cta: "Apostar",
  },
  {
    id: 3,
    title: "Bono de Bienvenida",
    description: "Regístrate hoy y obtén un bono del 100% en tu primer depósito",
    image: "/port2.png?height=600&width=1200",
    cta: "Registrarse",
  },
];

export const promotionsCarousel = [
  {
    id: 1,
    title: "Bono de Bienvenida 200%",
    description: "¡Duplicamos tu primer depósito hasta Bs 500! Regístrate ahora y comienza a ganar.",
    image: "/ce46161f9aae10d7b6b34d9023e0ac72.jpg?height=400&width=800&text=Bono+Bienvenida",
    color: "from-green-500 to-blue-600",
  },
  {
    id: 2,
    title: "Apuesta Sin Riesgo",
    description: "Haz tu primera apuesta sin riesgo. Si pierdes, te devolvemos hasta Bs 100.",
    image: "/Portada.png.webp?height=400&width=800&text=Apuesta+Sin+Riesgo",
    color: "from-purple-500 to-pink-600",
  },
  {
    id: 3,
    title: "50 Giros Gratis",
    description: "Recibe 50 giros gratis en nuestras mejores tragamonedas al registrarte.",
    image: "/placeholder.svg?height=400&width=800&text=Giros+Gratis",
    color: "from-yellow-500 to-red-600",
  },
];

export const promotionsGrid = [
  {
    title: "Bono de Bienvenida",
    description: "¡Obtén un 100% de bonificación en tu primer depósito hasta Bs 500!",
    icon: Gift,
    color: "bg-gradient-to-br from-green-500 to-green-700",
  },
  {
    title: "Apuesta Sin Riesgo",
    description: "Haz tu primera apuesta sin riesgo. Si pierdes, te devolvemos hasta Bs 100.",
    icon: Trophy,
    color: "bg-gradient-to-br from-blue-500 to-blue-700",
  },
  {
    title: "Giros Gratis",
    description: "Recibe 50 giros gratis en nuestras mejores tragamonedas al registrarte.",
    icon: Star,
    color: "bg-gradient-to-br from-purple-500 to-purple-700",
  },
];

export const popularCasinoGames = [
  { id: 1, name: "Book of Dead", provider: "Play'n GO", hot: true, new: false, image: "/juegos/juego1.png" },
  { id: 2, name: "Starburst", provider: "NetEnt", hot: true, new: false, image: "/juegos/juego2.jpg" },
  { id: 3, name: "Gonzo's Quest", provider: "NetEnt", hot: true, new: false, image: "/juegos/juego3.jpg" },
  { id: 4, name: "Sweet Bonanza", provider: "Pragmatic Play", hot: false, new: true, image: "/juegos/juego4.png" },
  { id: 5, name: "Wolf Gold", provider: "Pragmatic Play", hot: false, new: false, image: "/juegos/juego5.png" },
  { id: 6, name: "Reactoonz", provider: "Play'n GO", hot: false, new: true, image: "/juegos/juego6.png" },
  { id: 7, name: "Book of Ra", provider: "Novomatic", hot: false, new: false, image: "/juegos/juego7.png" },
  { id: 8, name: "Mega Moolah", provider: "Microgaming", hot: true, new: false, image: "/juegos/juego8.png" },
  { id: 9, name: "Dead or Alive", provider: "NetEnt", hot: false, new: false, image: "/juegos/juego1.png" },
  { id: 10, name: "Divine Fortune", provider: "NetEnt", hot: false, new: true, image: "/juegos/juego2.jpg" },
  { id: 11, name: "Immortal Romance", provider: "Microgaming", hot: false, new: false, image: "/juegos/juego3.jpg" },
  { id: 12, name: "Jammin' Jars", provider: "Push Gaming", hot: true, new: false, image: "/juegos/juego4.png" },
];

export const PRIORIDAD_LIGAS = [
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
