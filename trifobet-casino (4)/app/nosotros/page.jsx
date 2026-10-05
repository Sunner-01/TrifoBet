import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Award, Users, Globe, Clock, Heart } from "lucide-react"

export default function NosotrosPage() {
  const valores = [
    {
      icon: Shield,
      title: "Seguridad",
      description: "Utilizamos la última tecnología de encriptación SSL para proteger tus datos y transacciones.",
    },
    {
      icon: Award,
      title: "Excelencia",
      description: "Nos esforzamos por ofrecer la mejor experiencia de juego con los mejores proveedores del mercado.",
    },
    {
      icon: Users,
      title: "Comunidad",
      description: "Construimos una comunidad de jugadores donde todos se sienten bienvenidos y valorados.",
    },
    {
      icon: Globe,
      title: "Innovación",
      description: "Constantemente innovamos para traerte las últimas tendencias en juegos y apuestas.",
    },
    {
      icon: Clock,
      title: "Disponibilidad",
      description: "Nuestro soporte está disponible 24/7 para ayudarte cuando lo necesites.",
    },
    {
      icon: Heart,
      title: "Responsabilidad",
      description: "Promovemos el juego responsable y ofrecemos herramientas para controlar tu actividad.",
    },
  ]

  const estadisticas = [
    { numero: "500K+", label: "Jugadores Activos" },
    { numero: "1000+", label: "Juegos Disponibles" },
    { numero: "24/7", label: "Soporte al Cliente" },
    { numero: "99.9%", label: "Tiempo de Actividad" },
  ]

  const licencias = [
    { nombre: "Malta Gaming Authority", codigo: "MGA/B2C/123/2023" },
    { nombre: "UK Gambling Commission", codigo: "UKGC/39876/2023" },
    { nombre: "Curacao eGaming", codigo: "CEG-1234-2023" },
  ]

  return (
    <div className="container py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Acerca de TrifoBet</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Somos una plataforma líder en entretenimiento online, ofreciendo la mejor experiencia en casino y apuestas
          deportivas desde 2020.
        </p>
      </div>

      {/* Hero Section */}
      <section className="mb-16">
        <div className="relative h-64 md:h-96 rounded-xl overflow-hidden mb-8">
          <Image
            src="/nosotros_banner.png"
            alt="Equipo TrifoBet"
            width={1200}
            height={400}
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30 flex items-center justify-center">
            <div className="text-center text-white">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Nuestra Misión</h2>
              <p className="text-lg md:text-xl max-w-2xl">
                Proporcionar entretenimiento seguro, justo y emocionante a jugadores de todo el mundo
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Estadísticas */}
      <section className="mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {estadisticas.map((stat, index) => (
            <Card key={index} className="text-center p-6">
              <CardContent className="p-0">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.numero}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Nuestra Historia */}
      <section className="mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">Nuestra Historia</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                TrifoBet nació en 2020 con la visión de revolucionar la industria del entretenimiento online. Fundada
                por un equipo de expertos en tecnología y gaming, nuestra plataforma se ha convertido en una de las más
                confiables y populares del mercado.
              </p>
              <p>
                Desde nuestros inicios, hemos mantenido un compromiso inquebrantable con la innovación, la seguridad y
                la satisfacción del cliente. Cada día trabajamos para mejorar la experiencia de nuestros usuarios y
                expandir nuestras ofertas de entretenimiento.
              </p>
              <p>
                Hoy, con más de 500,000 jugadores activos y presencia en múltiples países, TrifoBet continúa creciendo y
                estableciendo nuevos estándares en la industria del gaming online.
              </p>
            </div>
          </div>
          <div className="relative">
            <Image
              src="/nosotros_banner.png"
              alt="Historia de TrifoBet"
              width={600}
              height={400}
              className="rounded-lg shadow-lg object-cover"
            />
          </div>
        </div>
      </section>

      {/* Nuestros Valores */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Nuestros Valores</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {valores.map((valor, index) => (
            <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-0">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <valor.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{valor.title}</h3>
                <p className="text-muted-foreground">{valor.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Licencias y Certificaciones */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Licencias y Certificaciones</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {licencias.map((licencia, index) => (
            <Card key={index} className="text-center p-6">
              <CardContent className="p-0">
                <div className="bg-green-100 dark:bg-green-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-bold mb-2">{licencia.nombre}</h3>
                <Badge
                  variant="outline"
                  className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                >
                  {licencia.codigo}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center mt-8">
          <p className="text-muted-foreground">
            Todas nuestras licencias están verificadas y actualizadas. Operamos bajo estrictas regulaciones para
            garantizar un entorno de juego seguro y justo.
          </p>
        </div>
      </section>

      {/* Juego Responsable */}
      <section className="bg-muted/30 p-8 rounded-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6">Compromiso con el Juego Responsable</h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-3xl mx-auto">
            En TrifoBet, el juego responsable es una prioridad. Ofrecemos herramientas y recursos para ayudar a nuestros
            jugadores a mantener el control y disfrutar del entretenimiento de manera segura.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Límites de Tiempo</h3>
              <p className="text-sm text-muted-foreground">Establece límites de sesión y tiempo de juego</p>
            </div>
            <div className="text-center">
              <div className="bg-yellow-100 dark:bg-yellow-900/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="font-semibold mb-2">Límites de Depósito</h3>
              <p className="text-sm text-muted-foreground">Controla cuánto puedes depositar</p>
            </div>
            <div className="text-center">
              <div className="bg-red-100 dark:bg-red-900/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="font-semibold mb-2">Autoexclusión</h3>
              <p className="text-sm text-muted-foreground">Toma un descanso cuando lo necesites</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}