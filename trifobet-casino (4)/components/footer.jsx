import Link from "next/link"
import { Facebook, Instagram, Twitter, ShieldCheck, HelpCircle, Phone, Mail, MapPin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="relative bg-[#09090b] text-zinc-300 border-t border-white/10 overflow-hidden">
      {/* Glow effect superior */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
      
      <div className="container mx-auto px-4 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-12">
          
          {/* Brand & Description */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-black text-3xl tracking-tighter bg-gradient-to-r from-green-400 to-green-600 text-transparent bg-clip-text drop-shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                TrifoBet
              </span>
            </Link>
            <p className="text-sm text-zinc-400 leading-relaxed">
              La plataforma líder en entretenimiento y apuestas deportivas. Disfruta de cuotas inmejorables, juegos de casino en vivo y retiros instantáneos con máxima seguridad.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300 group">
                <Facebook className="h-5 w-5 group-hover:scale-110 transition-transform" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300 group">
                <Instagram className="h-5 w-5 group-hover:scale-110 transition-transform" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300 group">
                <Twitter className="h-5 w-5 group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-white text-lg mb-6 flex items-center">
              <span className="w-8 h-1 bg-primary rounded-full mr-3"></span>
              Plataforma
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/apuestas" className="text-zinc-400 hover:text-primary hover:translate-x-2 transition-all flex items-center text-sm font-medium">
                  Apuestas Deportivas
                </Link>
              </li>
              <li>
                <Link href="/casino" className="text-zinc-400 hover:text-primary hover:translate-x-2 transition-all flex items-center text-sm font-medium">
                  Casino en Vivo
                </Link>
              </li>
              <li>
                <Link href="/promociones" className="text-zinc-400 hover:text-primary hover:translate-x-2 transition-all flex items-center text-sm font-medium">
                  Bonos y Promociones
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-bold text-white text-lg mb-6 flex items-center">
              <span className="w-8 h-1 bg-primary rounded-full mr-3"></span>
              Compañía
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/nosotros" className="text-zinc-400 hover:text-primary hover:translate-x-2 transition-all flex items-center text-sm font-medium">
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link href="/soporte" className="text-zinc-400 hover:text-primary hover:translate-x-2 transition-all flex items-center text-sm font-medium">
                  Centro de Ayuda
                </Link>
              </li>
              <li>
                <Link href="/reglas" className="text-zinc-400 hover:text-primary hover:translate-x-2 transition-all flex items-center text-sm font-medium">
                  Reglas y Políticas
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-white text-lg mb-6 flex items-center">
              <span className="w-8 h-1 bg-primary rounded-full mr-3"></span>
              Contacto
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-zinc-400">
                <HelpCircle className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="font-medium text-white">Soporte 24/7</p>
                  <p>Estamos aquí para ayudarte</p>
                </div>
              </li>
              <li className="flex items-start gap-3 text-sm text-zinc-400">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="font-medium text-white">Email</p>
                  <p>soporte@trifobet.com</p>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Banner */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="px-3 py-1.5 bg-white/10 rounded font-bold text-xs flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-green-400"/> PAGO SEGURO</div>
            <div className="px-3 py-1.5 bg-[#742092]/40 border border-[#742092] rounded font-bold text-xs text-white">YAPE</div>
            <div className="px-3 py-1.5 bg-blue-900/40 border border-blue-800 rounded font-bold text-xs text-blue-200">VISA</div>
            <div className="px-3 py-1.5 bg-orange-900/40 border border-orange-800 rounded font-bold text-xs text-orange-200">MASTERCARD</div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-red-500 flex items-center justify-center text-red-500 font-black text-sm shrink-0 shadow-[0_0_10px_rgba(239,68,68,0.3)]">
              +18
            </div>
            <div className="text-xs text-zinc-500 text-center md:text-left max-w-sm">
              El juego puede ser adictivo. Juega de forma responsable. TrifoBet opera bajo estrictos estándares de seguridad y encriptación.
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-zinc-600">
          <p>© {new Date().getFullYear()} TrifoBet. Todos los derechos reservados. Las apuestas deportivas están sujetas a nuestros términos y condiciones.</p>
        </div>
      </div>
    </footer>
  )
}