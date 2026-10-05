"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

import InfiniteMatchTicker from "./InfiniteMatchTicker"

/** Carrusel principal de portada con auto-avance y puntos de navegación. */
export default function HeroSection({ slides, currentSlide, setCurrentSlide, onCtaClick, isLoggedIn, featuredMatches }) {
  return (
    <section className="relative h-[600px] w-full overflow-hidden rounded-lg">
      {slides.map((slide, index) => (
        <motion.div
          key={slide.id}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: index === currentSlide ? 1 : 0 }}
          transition={{ duration: 0.5 }}
          style={{
            backgroundImage: `url(${slide.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent dark:from-black/80" />
          
          {/* Mostrar Textos Originales SOLO si NO está logueado */}
          {!isLoggedIn && (
            <div className="absolute bottom-0 left-0 p-8 md:p-16 md:w-2/3">
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: index === currentSlide ? 0 : 20, opacity: index === currentSlide ? 1 : 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-3xl font-bold text-white md:text-5xl"
            >
              {slide.title}
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: index === currentSlide ? 0 : 20, opacity: index === currentSlide ? 1 : 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-4 text-lg text-white/80 md:text-xl"
            >
              {slide.description}
            </motion.p>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: index === currentSlide ? 0 : 20, opacity: index === currentSlide ? 1 : 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-6"
            >
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90"
                onClick={() => onCtaClick(slide)}
              >
                {slide.cta}
              </Button>
            </motion.div>
          </div>
          )}
        </motion.div>
      ))}

      {/* Ticker Infinito superpuesto cuando ESTÁ logueado */}
      {isLoggedIn && (
        <InfiniteMatchTicker matches={featuredMatches} />
      )}

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 space-x-2 z-30">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 w-2 rounded-full ${index === currentSlide ? "bg-primary" : "bg-white/50"}`}
            aria-label={`Ir a diapositiva ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
