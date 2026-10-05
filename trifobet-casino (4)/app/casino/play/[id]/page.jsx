"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getStoredToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function GamePlayerPage() {
    const params = useParams();
    const router = useRouter();
    const [gameUrl, setGameUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [gameName, setGameName] = useState("");

    useEffect(() => {
        const initGame = async () => {
            try {
                setLoading(true);
                const gameId = parseInt(params.id);
                
                const apiUrl = process.env.NEXT_PUBLIC_API_Back_Url || 'http://localhost:3000';
                const res = await fetch(`${apiUrl}/juegos-casino/${gameId}`);
                
                if (!res.ok) {
                    setError("Juego no encontrado");
                    return;
                }
                
                const game = await res.json();
                
                if (!game.habilitado) {
                    setError("Este juego no está disponible actualmente");
                    return;
                }

                setGameName(game.nombre);

                const token = getStoredToken();
                if (!token) {
                    // Guardar URL de retorno si es necesario
                    router.push('/?login=true'); // O abrir modal de login
                    return;
                }

                const encodedToken = encodeURIComponent(token);
                let url = game.url_juego;
                
                if (!url) {
                    setError("El juego no tiene una URL configurada");
                    return;
                }

                // Lógica idéntica a la App Móvil
                if (url.includes('?')) {
                    url = `${url}&token=${encodedToken}`;
                } else {
                    url = `${url}?token=${encodedToken}`;
                }

                // Agregar hash también
                url = `${url}#token=${encodedToken}`;

                console.log("Launching game:", game.nombre);
                console.log("URL:", url);

                setGameUrl(url);
            } catch (err) {
                console.error("Error initializing game:", err);
                setError("Error al iniciar el juego");
            } finally {
                setLoading(false);
            }
        };

        initGame();

        // Actualizar saldo al entrar y salir del juego
        const refreshBalance = () => {
            window.dispatchEvent(new Event('auth-change'));
        };

        refreshBalance(); // Al montar

        return () => {
            refreshBalance(); // Al desmontar
        };
    }, [params.id, router]);

    if (loading) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-background text-foreground">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p>Cargando juego...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-background text-foreground p-4 text-center">
                <h2 className="text-2xl font-bold text-destructive mb-2">Error</h2>
                <p className="mb-6">{error}</p>
                <Button onClick={() => router.push('/casino')} variant="outline">
                    Volver al Casino
                </Button>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-background z-50 flex flex-col">
            {/* Game Header */}
            <div className="h-14 bg-card border-b border-border/20 flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push('/casino')}
                        className="text-muted-foreground hover:text-foreground hover:bg-accent"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <span className="font-bold text-foreground">{gameName}</span>
                </div>
            </div>

            {/* Game Iframe */}
            <div className="flex-1 w-full bg-black relative">
                {gameUrl && (
                    <iframe
                        src={gameUrl}
                        className="absolute inset-0 w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                        allowFullScreen
                    />
                )}
            </div>
        </div>
    );
}
