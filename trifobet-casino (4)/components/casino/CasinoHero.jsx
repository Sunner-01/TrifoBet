import Image from "next/image";

export function CasinoHero() {
  return (
    <div className="relative h-[200px] md:h-[300px] w-full overflow-hidden bg-[#0d1f10]">
      
      {/* Imagen de Fondo_casino a la derecha (z-0) */}
      <div className="absolute right-0 top-0 h-full w-[70%] z-0 hidden sm:block">
        <Image
          src="/Fondo_casino.png"
          alt="Fondo Casino Right"
          fill
          className="object-cover object-left"
        />
      </div>

      {/* Capa de difuminado general: Sólido a la izquierda, transparente a la derecha (z-10) */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#143118] via-[#143118]/90 to-transparent z-10" />

      {/* Contenido de texto (z-20) */}
      <div className="relative z-20 container h-full flex flex-col justify-center">
        <h1 className="text-4xl md:text-6xl font-black text-white mb-2 tracking-tighter drop-shadow-lg">
          CASINO <span className="text-green-500">ONLINE</span>
        </h1>
        <p className="text-white/80 text-lg max-w-xl drop-shadow-md">
          Disfruta de los mejores juegos de casino, slots y mesas en vivo con la mejor tecnología.
        </p>
      </div>
    </div>
  );
}
