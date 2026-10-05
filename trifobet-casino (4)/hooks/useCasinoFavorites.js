"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import { getStoredToken } from "@/lib/auth";

export function useCasinoFavorites() {
  const [token, setToken] = useState(null);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingIds, setPendingIds] = useState([]);
  const [error, setError] = useState("");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const generation = useRef(0);
  const locks = useRef(new Set());
  const sessionToken = useRef(undefined);

  useEffect(() => {
    const syncSession = () => {
      const nextToken = getStoredToken();
      if (nextToken === sessionToken.current) return;
      sessionToken.current = nextToken;
      // Invalidar inmediatamente respuestas pertenecientes a otra sesión.
      generation.current += 1;
      locks.current = new Set();
      setPendingIds([]);
      setFavoriteIds([]);
      setError("");
      setOnlyFavorites(false);
      setLoading(Boolean(nextToken));
      setToken(nextToken);
    };
    const onStorage = (event) => {
      if (event.key === "token" || event.key === null) syncSession();
    };
    syncSession();
    window.addEventListener("auth-change", syncSession);
    window.addEventListener("storage", onStorage);
    return () => {
      generation.current += 1;
      window.removeEventListener("auth-change", syncSession);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  useEffect(() => {
    const current = ++generation.current;
    let disposed = false;
    setFavoriteIds([]);
    setError("");
    setLoading(Boolean(token));
    if (token) {
      apiFetch("/casino-favoritos/me")
        .then((ids) => {
          if (!disposed && current === generation.current) setFavoriteIds(ids);
        })
        .catch((err) => {
          if (!disposed && current === generation.current) setError(err.message);
        })
        .finally(() => {
          if (!disposed && current === generation.current) setLoading(false);
        });
    }
    return () => { disposed = true; };
  }, [token]);

  const toggleFavorite = useCallback(async (gameId) => {
    if (!token || getStoredToken() !== token) {
      setError("Inicia sesión para guardar tus juegos favoritos.");
      return;
    }
    const id = Number(gameId);
    if (loading || locks.current.has(id)) return;
    const current = generation.current;
    const currentLocks = locks.current;
    currentLocks.add(id);
    setPendingIds((ids) => [...ids, id]);
    setError("");
    const wasFavorite = favoriteIds.includes(id);
    try {
      await apiFetch(`/casino-favoritos/${id}`, {
        method: wasFavorite ? "DELETE" : "PUT",
      });
      if (current !== generation.current || getStoredToken() !== token) return;
      setFavoriteIds((ids) => wasFavorite
        ? ids.filter((item) => item !== id)
        : [...new Set([...ids, id])]);
    } catch (err) {
      if (current === generation.current) setError(err.message);
    } finally {
      currentLocks.delete(id);
      if (current === generation.current) {
        setPendingIds((ids) => ids.filter((item) => item !== id));
      }
    }
  }, [token, loading, favoriteIds]);

  return {
    favoriteIds, pendingIds, loading, error, onlyFavorites,
    setOnlyFavorites, toggleFavorite, isLoggedIn: Boolean(token),
  };
}
