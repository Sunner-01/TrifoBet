"use client"

import { useState, useEffect } from "react"
import AuthModal from "@/components/auth-modal"
import BetSlip from "@/components/bet-slip"
import { useRouter } from "next/navigation"
import { getStoredToken } from "@/lib/auth"

// Componentes de sección extraídos (SRP)
import HeroSection from "@/components/home/HeroSection"
import PromotionsCarousel from "@/components/home/PromotionsCarousel"
import PromotionsGrid from "@/components/home/PromotionsGrid"
import CtaSection from "@/components/home/CtaSection"
import FeaturedMatchesGrid from "@/components/home/FeaturedMatchesGrid"

// Custom Hooks (Cerebros de la lógica)
import { useMatchesLogic } from "@/hooks/useMatchesLogic"
import { useBetSelection } from "@/hooks/useBetSelection"

// Datos estáticos
import { slides, promotionsCarousel, promotionsGrid, popularCasinoGames } from "@/lib/constants"

export default function Home() {
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalTab, setAuthModalTab] = useState("register")
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => setIsLoggedIn(!!getStoredToken())
    checkAuth()
    window.addEventListener('auth-change', checkAuth)
    return () => window.removeEventListener('auth-change', checkAuth)
  }, [])

  // Extraer lógica de estado de apuestas
  const {
    showBetSlip,
    setShowBetSlip,
    selectedBets,
    handleBetSelection,
    isBetSelected,
    removeBet,
    setSelectedBets
  } = useBetSelection()

  // Extraer lógica de llamadas a la API de deportes y ordenamiento matemático
  const { featuredMatches, loadingMatches } = useMatchesLogic()

  // Avance automático del carrusel hero cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const openAuthModal = (tab) => {
    setAuthModalTab(tab)
    setAuthModalOpen(true)
  }

  return (
    <div className="flex flex-col gap-8 pb-8">
      <HeroSection
        slides={slides}
        currentSlide={currentSlide}
        setCurrentSlide={setCurrentSlide}
        onCtaClick={(cta) => { if (cta === "Registrarse") openAuthModal("register") }}
        isLoggedIn={isLoggedIn}
        featuredMatches={featuredMatches}
      />

      <PromotionsCarousel
        promotions={promotionsCarousel}
        onClaim={() => openAuthModal("register")}
      />

      {/* Grid centralizado que conserva todo el diseño original y animaciones */}
      <FeaturedMatchesGrid 
        loadingMatches={loadingMatches}
        featuredMatches={featuredMatches}
        handleBetSelection={handleBetSelection}
        isBetSelected={isBetSelected}
      />

      <PromotionsGrid
        promotions={promotionsGrid}
        onClaim={() => openAuthModal("register")}
      />

      <CtaSection
        onRegister={() => openAuthModal("register")}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab={authModalTab}
      />

      <BetSlip
        open={showBetSlip}
        onOpenChange={setShowBetSlip}
        bets={selectedBets}
        onRemoveBet={removeBet}
        onClearAll={() => {
          setSelectedBets([])
          setShowBetSlip(false)
        }}
      />
    </div>
  )
}
