"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiGet } from "@/lib/api";
import { getStoredToken } from "@/lib/auth";

export function useSportsHistory(estado = "todas") {
  const [draftFrom, setDraftFrom] = useState("");
  const [draftTo, setDraftTo] = useState("");
  const [range, setRange] = useState({ desde: "", hasta: "" });
  const [position, setPosition] = useState({ page: 1, estado });
  const [revision, setRevision] = useState(0);
  const [token, setToken] = useState(null);
  const [validationError, setValidationError] = useState("");
  const [result, setResult] = useState({ bets: [], total: 0, loading: true, error: "", page: 1 });
  const generation = useRef(0);
  const session = useRef(undefined);
  const page = position.estado === estado ? position.page : 1;
  const pageSize = 20;

  useEffect(() => {
    const sync = () => {
      const nextToken = getStoredToken();
      if (nextToken === session.current) return;
      session.current = nextToken;
      generation.current += 1;
      setResult({ bets: [], total: 0, loading: Boolean(nextToken), error: "", page: 1 });
      setPosition({ page: 1, estado });
      setToken(nextToken);
    };
    const onStorage = (event) => { if (event.key === "token" || event.key === null) sync(); };
    sync();
    window.addEventListener("auth-change", sync);
    window.addEventListener("storage", onStorage);
    return () => {
      generation.current += 1;
      window.removeEventListener("auth-change", sync);
      window.removeEventListener("storage", onStorage);
    };
  }, [estado]);

  useEffect(() => {
    const current = ++generation.current;
    let disposed = false;
    if (!token) {
      setResult({ bets: [], total: 0, loading: false, error: "Inicia sesión para consultar tus apuestas.", page });
      return;
    }
    setResult({ bets: [], total: 0, loading: true, error: "", page });
    const params = new URLSearchParams({ limit: String(pageSize), offset: String((page - 1) * pageSize) });
    if (estado !== "todas") params.set("estado", estado);
    if (range.desde) params.set("desde", range.desde);
    if (range.hasta) params.set("hasta", range.hasta);
    apiGet(`/apuestas-deportivas/historial?${params}`)
      .then((data) => {
        if (disposed || current !== generation.current || getStoredToken() !== token) return;
        setResult({ bets: data.apuestas || [], total: data.total || 0, loading: false, error: "", page });
      })
      .catch((err) => {
        if (disposed || current !== generation.current || getStoredToken() !== token) return;
        setResult({ bets: [], total: 0, loading: false, error: err.message, page });
      });
    return () => { disposed = true; };
  }, [token, estado, range, page, revision]);

  const apply = () => {
    if (draftFrom && draftTo && draftFrom > draftTo) {
      setValidationError("Desde no puede ser posterior a hasta.");
      return;
    }
    setValidationError("");
    setPosition({ page: 1, estado });
    setRange({ desde: draftFrom, hasta: draftTo });
  };
  const clear = () => {
    setDraftFrom(""); setDraftTo(""); setValidationError("");
    setPosition({ page: 1, estado });
    setRange({ desde: "", hasta: "" });
  };
  const refresh = useCallback(() => setRevision((value) => value + 1), []);
  const setPage = (value) => setPosition({ page: value, estado });
  return {
    ...result, page, pageSize, draftFrom, draftTo, setDraftFrom, setDraftTo,
    apply, clear, refresh, setPage, range, validationError,
    loading: result.loading || result.page !== page,
  };
}
