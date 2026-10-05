// SRP: este componente tiene una sola responsabilidad — mostrar la grilla de tarjetas de promoción con íconos.
"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Gift, ChevronRight } from "lucide-react"

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

/** Grilla de tarjetas de promoción con ícono, descripción y botón de reclamación. */
export default function PromotionsGrid({ promotions, onClaim }) {
  return (
    <motion.section
      className="container"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-bold flex items-center">
          <Gift className="mr-2 h-6 w-6 text-primary" />
          Promociones
        </h2>
        <Button variant="ghost" asChild>
          <Link href="/promociones" className="flex items-center">
            Ver todas <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {promotions.map((promo, index) => (
          <motion.div key={index} variants={fadeInUp}>
            <Card className="overflow-hidden h-full border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-6 h-full flex flex-col">
                <div className={`p-3 rounded-full ${promo.color} text-white w-12 h-12 flex items-center justify-center mb-4`}>
                  <promo.icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-xl mb-2">{promo.title}</h3>
                <p className="text-muted-foreground mb-6 flex-grow">{promo.description}</p>
                <Button
                  className="w-full bg-gradient-to-r from-primary/90 to-primary hover:from-primary hover:to-primary/90 transition-all duration-300"
                  onClick={onClaim}
                >
                  Reclamar Ahora
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}
