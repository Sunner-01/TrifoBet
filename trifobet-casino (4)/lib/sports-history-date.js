export function formatSportsHistoryDate(value) {
  if (!value) return "—";
  // El backend escribe fecha_creacion en UTC. PostgreSQL TIMESTAMP puede
  // devolverla sin sufijo; se explicita UTC antes de mostrarla en Bolivia.
  const text = String(value).replace(" ", "T");
  const normalized = /(?:Z|[+-]\d{2}(?::?\d{2})?)$/i.test(text) ? text : `${text}Z`;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("es-BO", {
    timeZone: "America/La_Paz", day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}
