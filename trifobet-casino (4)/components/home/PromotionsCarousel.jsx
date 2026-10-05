"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Gift, ChevronRight } from "lucide-react"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"

/** Carrusel horizontal de promociones con imagen de fondo y gradiente de color. */
export default function PromotionsCarousel({ promotions, onClaim }) {
  return (
    <section className="container">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-bold flex items-center">
          <Gift className="mr-2 h-6 w-6 text-primary" />
          Promociones Destacadas
        </h2>
        <Button variant="ghost" asChild>
          <Link href="/promociones" className="flex items-center">
            Ver todas <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <Carousel className="w-full">
        <CarouselContent>
          {promotions.map((promo) => (
            <CarouselItem key={promo.id}>
              <div className="relative h-[200px] sm:h-[250px] md:h-[300px] rounded-xl overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-r ${promo.color} opacity-80 z-10`} />
                <Image
                  src={promo.image || "/placeholder.svg"}
                  alt={promo.title}
                  width={800}
                  height={400}
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 z-20 flex flex-col justify-center p-8 text-white">
                  <h3 className="text-2xl md:text-4xl font-bold mb-2">{promo.title}</h3>
                  <p className="text-sm md:text-lg mb-6 max-w-md">{promo.description}</p>
                  <Button
                    className="w-fit bg-white text-black hover:bg-white/90"
                    onClick={onClaim}
                  >
                    Reclamar Ahora
                  </Button>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="hidden sm:block">
          <CarouselPrevious className="left-2" />
          <CarouselNext className="right-2" />
        </div>
      </Carousel>
    </section>
  )
}
