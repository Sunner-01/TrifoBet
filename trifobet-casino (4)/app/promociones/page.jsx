import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gift, Trophy, Star, Clock, Users, Zap } from "lucide-react"

export default function PromocionesPage() {
  const promociones = [
    {
      id: 1,
      title: "Bono de Bienvenida 200%",
      description:
        "¡Duplicamos tu primer depósito hasta Bs 500! Además, recibe 100 giros gratis en nuestras mejores tragamonedas.",
      image: "/promociones_banner.png",
      icon: Gift,
      color: "from-green-500 to-blue-600",
      terms: "Depósito mínimo Bs 20. Rollover 35x. Válido por 30 días.",
      featured: true,
    },
    {
      id: 2,
      title: "Apuesta Sin Riesgo",
      description:
        "Haz tu primera apuesta deportiva sin riesgo. Si pierdes, te devolvemos hasta Bs 100 en apuesta gratis.",
      image: "/promociones_banner.png",
      icon: Trophy,
      color: "from-purple-500 to-pink-600",
      terms: "Solo para nuevos usuarios. Cuota mínima 1.50. Válido por 7 días.",
      featured: true,
    },
    {
      id: 3,
      title: "50 Giros Gratis",
      description: "Recibe 50 giros gratis en Book of Dead solo por registrarte. ¡Sin depósito requerido!",
      image: "/promociones_banner.png",
      icon: Star,
      color: "from-yellow-500 to-red-600",
      terms: "Solo para nuevos usuarios. Ganancias máximas Bs 100. Rollover 40x.",
      featured: true,
    },
    {
      id: 4,
      title: "Cashback Semanal",
      description: "Recibe hasta 10% de cashback en todas tus pérdidas de la semana. Todos los viernes.",
      image: "/promociones_banner.png",
      icon: Clock,
      color: "from-blue-500 to-cyan-600",
      terms: "Cashback mínimo Bs 0.50 Máximo Bs 500 por semana. Sin rollover.",
      featured: false,
    },
    {
      id: 5,
      title: "Torneo de Slots",
      description: "Participa en nuestro torneo semanal de slots y gana hasta Bs 10,000 en premios.",
      image: "/promociones_banner.png",
      icon: Users,
      color: "from-orange-500 to-red-600",
      terms: "Apuesta mínima Bs 1 por giro. Duración: 7 días. 100 ganadores.",
      featured: false,
    },
    {
      id: 6,
      title: "Reload Bonus",
      description: "50% de bonus en tu segundo depósito hasta Bs 300. ¡Sigue ganando con nosotros!",
      image: "/promociones_banner.png",
      icon: Zap,
      color: "from-indigo-500 to-purple-600",
      terms: "Depósito mínimo Bs 50. Rollover 30x. Válido por 14 días.",
      featured: false,
    },
  ]

  const promocionesDestacadas = promociones.filter((promo) => promo.featured)
  const otrasPromociones = promociones.filter((promo) => !promo.featured)

  return (
    <div className="container py-8">
      <div className="flex items-center gap-2 mb-6">
        <Gift className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Promociones</h1>
      </div>

      {/* Promociones Destacadas */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Star className="h-6 w-6 text-yellow-500" />
          Promociones Destacadas
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {promocionesDestacadas.map((promo) => (
            <Card
              key={promo.id}
              className="overflow-hidden border-2 border-primary/20 hover:border-primary/50 transition-all duration-300"
            >
              <div className="relative h-48">
                <div className={`absolute inset-0 bg-gradient-to-r ${promo.color} opacity-80 z-10`} />
                <Image
                  src={promo.image || "/placeholder.svg"}
                  alt={promo.title}
                  width={500}
                  height={300}
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 z-20 flex flex-col justify-center p-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <promo.icon className="h-6 w-6" />
                    <Badge className="bg-white/20 text-white border-white/30">Destacado</Badge>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{promo.title}</h3>
                </div>
              </div>
              <CardContent className="p-6">
                <p className="text-muted-foreground mb-4">{promo.description}</p>
                <div className="bg-muted/50 p-3 rounded-lg mb-4">
                  <p className="text-xs text-muted-foreground">
                    <strong>Términos:</strong> {promo.terms}
                  </p>
                </div>
                <Button className="w-full bg-gradient-to-r from-primary/90 to-primary hover:from-primary hover:to-primary/90">
                  Reclamar Ahora
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Otras Promociones */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Todas las Promociones</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {otrasPromociones.map((promo) => (
            <Card key={promo.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="flex">
                <div className="relative w-1/3">
                  <div className={`absolute inset-0 bg-gradient-to-r ${promo.color} opacity-80 z-10`} />
                  <Image
                    src={promo.image || "/placeholder.svg"}
                    alt={promo.title}
                    width={200}
                    height={200}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute inset-0 z-20 flex items-center justify-center">
                    <promo.icon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="flex-1 p-4">
                  <h3 className="font-bold text-lg mb-2">{promo.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{promo.description}</p>
                  <div className="bg-muted/50 p-2 rounded text-xs text-muted-foreground mb-3">
                    <strong>Términos:</strong> {promo.terms}
                  </div>
                  <Button size="sm" className="w-full">
                    Reclamar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Términos Generales */}
      <section className="mt-12 bg-muted/30 p-6 rounded-lg">
        <h3 className="font-bold text-lg mb-4">Términos y Condiciones Generales</h3>
        <div className="text-sm text-muted-foreground space-y-2">
          <p>• Las promociones están sujetas a términos y condiciones específicos.</p>
          <p>• Solo para mayores de 18 años. Juegue con responsabilidad.</p>
          <p>• TrifoBet se reserva el derecho de modificar o cancelar promociones en cualquier momento.</p>
          <p>• Los bonos deben ser utilizados dentro del período especificado o expirarán.</p>
          <p>• Se aplican requisitos de apuesta (rollover) a todos los bonos.</p>
          <p>• Una promoción por usuario, hogar, dirección IP o dispositivo.</p>
        </div>
      </section>
    </div>
  )
}