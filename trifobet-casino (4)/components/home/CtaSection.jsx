// SRP: este componente tiene una sola responsabilidad — mostrar el banner de llamada a la acción al final de la página.
"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

/** Sección CTA final que invita al usuario a registrarse o conocer más. */
export default function CtaSection({ onRegisterClick }) {
  return (
    <section className="bg-primary/10 py-12">
      <div className="container text-center">
        <motion.h2
          className="text-2xl md:text-4xl font-bold mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          ¿Listo para comenzar?
        </motion.h2>
        <motion.p
          className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Únete a miles de jugadores y disfruta de la mejor experiencia de casino y apuestas en línea.
        </motion.p>
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Button
            size="lg"
            onClick={onRegisterClick}
            className="bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 transition-all duration-300"
          >
            Crear Cuenta
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/nosotros">Conocer Más</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
