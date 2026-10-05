BEGIN;

ALTER TABLE public.ticket_soporte
  ADD COLUMN IF NOT EXISTS prioridad text;

UPDATE public.ticket_soporte
SET prioridad = 'normal'
WHERE prioridad IS NULL
   OR prioridad NOT IN ('baja', 'normal', 'alta', 'urgente');

ALTER TABLE public.ticket_soporte
  ALTER COLUMN prioridad SET DEFAULT 'normal',
  ALTER COLUMN prioridad SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'ticket_soporte_prioridad_check'
      AND conrelid = 'public.ticket_soporte'::regclass
  ) THEN
    ALTER TABLE public.ticket_soporte
      ADD CONSTRAINT ticket_soporte_prioridad_check
      CHECK (prioridad IN ('baja', 'normal', 'alta', 'urgente'));
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_ticket_soporte_prioridad
  ON public.ticket_soporte (prioridad);

COMMIT;
