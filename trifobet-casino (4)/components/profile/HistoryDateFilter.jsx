"use client";

import { useId } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function HistoryDateFilter({ history }) {
  const id = useId();
  return (
    <div className="space-y-2 py-3">
      <form className="flex flex-wrap items-end gap-2" onSubmit={(event) => { event.preventDefault(); history.apply(); }}>
        <div>
          <label htmlFor={`${id}-desde`} className="block text-xs mb-1">Desde</label>
          <Input id={`${id}-desde`} type="date" value={history.draftFrom}
            onChange={(event) => history.setDraftFrom(event.target.value)} className="w-40" />
        </div>
        <div>
          <label htmlFor={`${id}-hasta`} className="block text-xs mb-1">Hasta</label>
          <Input id={`${id}-hasta`} type="date" value={history.draftTo}
            onChange={(event) => history.setDraftTo(event.target.value)} className="w-40" />
        </div>
        <Button type="submit" disabled={history.loading}>Aplicar</Button>
        <Button type="button" variant="outline" disabled={history.loading} onClick={history.clear}>Limpiar</Button>
      </form>
      <p className="text-xs text-muted-foreground">Días completos en hora de Bolivia (America/La_Paz).</p>
      {history.validationError && <p role="alert" className="text-sm text-red-500">{history.validationError}</p>}
      {history.error && <p role="alert" className="text-sm text-red-500">{history.error}</p>}
    </div>
  );
}

export function HistoryPagination({ history }) {
  const pages = Math.max(1, Math.ceil(history.total / history.pageSize));
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 py-3">
      <p className="text-xs text-muted-foreground" aria-live="polite">
        {history.loading ? "Cargando historial…" : `${history.total} apuestas · Página ${history.page} de ${pages}`}
      </p>
      <div className="flex gap-2">
        <Button type="button" size="sm" variant="outline" disabled={history.loading || history.page <= 1}
          onClick={() => history.setPage(history.page - 1)}>Anterior</Button>
        <Button type="button" size="sm" variant="outline" disabled={history.loading || history.page >= pages || Boolean(history.error)}
          onClick={() => history.setPage(history.page + 1)}>Siguiente</Button>
      </div>
    </div>
  );
}
