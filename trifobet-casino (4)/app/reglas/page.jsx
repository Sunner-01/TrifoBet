"use client"

import { useState } from "react"
import { BookOpen, ShieldAlert, Scale, ScrollText, Lock, FileText, ChevronRight } from "lucide-react"

export default function ReglasPage() {
  const [activeSection, setActiveSection] = useState("terminos")

  const sidebarLinks = [
    { id: "terminos", label: "Términos y Condiciones", icon: ScrollText },
    { id: "apuestas", label: "Reglas de Apuestas", icon: Scale },
    { id: "casino", label: "Políticas del Casino", icon: BookOpen },
    { id: "privacidad", label: "Política de Privacidad", icon: Lock },
    { id: "juego-responsable", label: "Juego Responsable", icon: ShieldAlert },
  ]

  const renderContent = () => {
    switch (activeSection) {
      case "terminos":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <ScrollText className="text-primary w-6 h-6" />
              Términos y Condiciones Generales
            </h2>
            <div className="prose prose-invert max-w-none text-zinc-400">
              <h3 className="text-xl font-semibold text-zinc-200 mt-6 mb-3">1. Introducción</h3>
              <p>
                Al acceder y utilizar TrifoBet, usted acepta cumplir y estar sujeto a los siguientes términos y condiciones. Es responsabilidad exclusiva del usuario revisar estos términos periódicamente.
              </p>
              
              <h3 className="text-xl font-semibold text-zinc-200 mt-6 mb-3">2. Elegibilidad de la Cuenta</h3>
              <p>
                Usted debe ser mayor de 18 años para registrarse y jugar. TrifoBet se reserva el derecho de solicitar pruebas de identidad y edad (KYC) en cualquier momento. Las cuentas que no puedan ser verificadas serán suspendidas.
              </p>

              <h3 className="text-xl font-semibold text-zinc-200 mt-6 mb-3">3. Depósitos y Retiros</h3>
              <p>
                Los fondos depositados deben ser utilizados para jugar en nuestra plataforma. El monto mínimo de retiro es de Bs 10. TrifoBet se reserva el derecho de aplicar verificaciones de identidad antes de procesar retiros superiores a ciertos límites por motivos de seguridad y anti-lavado de dinero (AML).
              </p>

              <h3 className="text-xl font-semibold text-zinc-200 mt-6 mb-3">4. Cierre de Cuenta</h3>
              <p>
                Usted puede cerrar su cuenta en cualquier momento contactando a nuestro equipo de soporte. Nos reservamos el derecho de cerrar o suspender cuentas involucradas en actividades fraudulentas o en violación de estos términos.
              </p>
            </div>
          </div>
        )
      case "apuestas":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Scale className="text-primary w-6 h-6" />
              Reglas de Apuestas Deportivas
            </h2>
            <div className="prose prose-invert max-w-none text-zinc-400">
              <h3 className="text-xl font-semibold text-zinc-200 mt-6 mb-3">1. Validez de las Apuestas</h3>
              <p>
                Una vez que una apuesta es confirmada por nuestro sistema y se genera el boleto (ticket), no puede ser cancelada ni modificada por el usuario. Es responsabilidad del usuario revisar su cupón de apuesta antes de confirmar.
              </p>

              <h3 className="text-xl font-semibold text-zinc-200 mt-6 mb-3">2. Resultados Oficiales</h3>
              <p>
                Todas las apuestas se determinan basándose en el resultado oficial emitido por el organismo rector de cada deporte respectivo inmediatamente después de finalizar el evento. TrifoBet no reconocerá protestas o decisiones volcadas posteriormente.
              </p>

              <h3 className="text-xl font-semibold text-zinc-200 mt-6 mb-3">3. Eventos Cancelados o Pospuestos</h3>
              <p>
                Si un evento es cancelado, suspendido o pospuesto, y no se reanuda dentro de las 48 horas siguientes a la hora de inicio programada original, todas las apuestas pendientes de ese evento serán anuladas y el monto apostado será reembolsado.
              </p>

              <h3 className="text-xl font-semibold text-zinc-200 mt-6 mb-3">4. Errores Obvios (Palpables)</h3>
              <p>
                TrifoBet se esfuerza por asegurar la exactitud de todas las cuotas, pero si debido a un error humano o de sistema se ofrece una cuota materialmente incorrecta, nos reservamos el derecho de anular dichas apuestas y reembolsar el importe.
              </p>
            </div>
          </div>
        )
      case "casino":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <BookOpen className="text-primary w-6 h-6" />
              Políticas del Casino
            </h2>
            <div className="prose prose-invert max-w-none text-zinc-400">
              <h3 className="text-xl font-semibold text-zinc-200 mt-6 mb-3">1. Justicia del Juego (RNG)</h3>
              <p>
                Todos los juegos virtuales en el Casino de TrifoBet operan mediante un Generador de Números Aleatorios (RNG) certificado, el cual asegura resultados completamente aleatorios, impredecibles y justos en cada ronda o giro.
              </p>

              <h3 className="text-xl font-semibold text-zinc-200 mt-6 mb-3">2. Desconexiones y Fallos del Sistema</h3>
              <p>
                En caso de que usted sufra una desconexión de internet durante el desarrollo de una ronda, el sistema guardará el estado exacto del juego. Podrá reanudar la ronda una vez se reconecte. Los fallos del sistema por parte del servidor anulan todos los pagos y jugadas afectadas.
              </p>

              <h3 className="text-xl font-semibold text-zinc-200 mt-6 mb-3">3. Casino en Vivo</h3>
              <p>
                Para las mesas de Casino en Vivo (Crupier en directo), las decisiones del pit boss del proveedor de juego son finales. Cualquier error del crupier físico que requiera re-tirar una bola o carta se manejará bajo las estrictas reglas de videovigilancia de dicho proveedor.
              </p>
            </div>
          </div>
        )
      case "privacidad":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Lock className="text-primary w-6 h-6" />
              Política de Privacidad
            </h2>
            <div className="prose prose-invert max-w-none text-zinc-400">
              <h3 className="text-xl font-semibold text-zinc-200 mt-6 mb-3">1. Recopilación de Datos</h3>
              <p>
                Recopilamos información personal durante su registro (nombre, correo electrónico, documento de identidad) así como información técnica durante su navegación (dirección IP, tipo de dispositivo) para garantizar la seguridad de su cuenta y proveerle el servicio.
              </p>

              <h3 className="text-xl font-semibold text-zinc-200 mt-6 mb-3">2. Uso de la Información</h3>
              <p>
                Su información personal nunca será vendida a terceros. Solo será compartida con proveedores de pago estrictamente para procesar transacciones (por ejemplo, pasarelas de pago) o si es requerida por autoridades legales competentes mediante orden judicial.
              </p>

              <h3 className="text-xl font-semibold text-zinc-200 mt-6 mb-3">3. Seguridad</h3>
              <p>
                Empleamos tecnología de encriptación de grado bancario (SSL) de punta a punta para asegurar que todos los datos y transacciones financieras estén fuertemente protegidos contra acceso no autorizado.
              </p>
            </div>
          </div>
        )
      case "juego-responsable":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <ShieldAlert className="text-primary w-6 h-6" />
              Juego Responsable
            </h2>
            <div className="prose prose-invert max-w-none text-zinc-400">
              <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg mb-6">
                <p className="text-destructive font-medium text-sm flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5" />
                  El juego debe ser considerado como una forma de entretenimiento, no como un medio para ganar dinero fácil o pagar deudas.
                </p>
              </div>

              <h3 className="text-xl font-semibold text-zinc-200 mt-6 mb-3">1. Prevención a Menores</h3>
              <p>
                TrifoBet tiene una política estricta de cero tolerancia hacia el juego de menores de edad. Requerimos verificación de identidad a nuestros usuarios y recomendamos encarecidamente a los padres el uso de software de control parental.
              </p>

              <h3 className="text-xl font-semibold text-zinc-200 mt-6 mb-3">2. Autoexclusión y Pausas</h3>
              <p>
                Si siente que está perdiendo el control de su actividad de juego, puede contactar a nuestro soporte para solicitar una congelación temporal de su cuenta (Time-Out) o una Autoexclusión definitiva, durante la cual no le permitiremos acceder a nuestra plataforma bajo ninguna circunstancia.
              </p>

              <h3 className="text-xl font-semibold text-zinc-200 mt-6 mb-3">3. Reconociendo un Problema</h3>
              <p>
                Si nota que está apostando más de lo que puede permitirse perder, intentando perseguir sus pérdidas desesperadamente, o descuidando sus responsabilidades laborales y familiares, le sugerimos buscar ayuda profesional inmediatamente en organizaciones locales contra la ludopatía.
              </p>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-300 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center gap-3 mb-8">
          <FileText className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-black text-white tracking-tight">Reglas y Políticas</h1>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <nav className="space-y-1 bg-white/5 p-3 rounded-xl border border-white/10 sticky top-24">
              {sidebarLinks.map((link) => {
                const Icon = link.icon
                const isActive = activeSection === link.id
                return (
                  <button
                    key={link.id}
                    onClick={() => setActiveSection(link.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                        : "text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? "text-primary-foreground" : "text-zinc-500"}`} />
                    <span className="text-left flex-1">{link.label}</span>
                    {isActive && <ChevronRight className="w-4 h-4 opacity-70" />}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            <div className="bg-white/5 rounded-xl border border-white/10 p-6 md:p-8 min-h-[500px]">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
