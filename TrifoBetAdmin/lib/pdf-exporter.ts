import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportDashboardPDF = (data: any, range: string) => {
  if (!data) return;
  const doc = new jsPDF();
  const { kpis, recientes, ultimosUsuarios } = data;

  doc.setFontSize(20);
  doc.text('Reporte de Dashboard TrifoBet', 14, 22);
  doc.setFontSize(12);
  doc.text(`Rango: ${range}`, 14, 32);
  doc.text(`Generado: ${new Date().toLocaleString()}`, 14, 40);

  // KPIs Generales
  autoTable(doc, {
    startY: 50,
    head: [['KPI', 'Valor']],
    body: [
      ['Total Usuarios', `${kpis.usuariosTotales}`],
      ['Total Recargas (Aprobadas)', `Bs. ${Number(kpis.totalRecargas || 0).toFixed(2)}`],
      ['Total Retiros (Pagados)', `Bs. ${Number(kpis.totalRetiros || 0).toFixed(2)}`],
      ['GGR Deportivo (Ganancia Neta)', `Bs. ${Number(kpis.ggr || 0).toFixed(2)}`],
      ['GGR Casino (Ganancia Neta)', `Bs. ${Number(kpis.casinoGGR || 0).toFixed(2)}`],
      ['Retiros Pendientes', `${kpis.retirosPendientes || 0}`],
      ['Recargas Pendientes', `${kpis.recargasPendientes || 0}`],
      ['KYC Pendientes', `${kpis.kycPendientes || 0}`]
    ],
    headStyles: { fillColor: [16, 185, 129] }
  });

  // Últimos Usuarios
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 15,
    head: [['ID', 'Usuario', 'Correo', 'Saldo', 'Fecha Registro']],
    body: ultimosUsuarios.slice(0, 10).map((u: any) => [
      u.id, 
      u.nombre_usuario, 
      u.correo, 
      `Bs. ${Number(u.saldo).toFixed(2)}`,
      new Date(u.created_at).toLocaleDateString()
    ]),
    headStyles: { fillColor: [59, 130, 246] }
  });

  // Últimas Transacciones
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 15,
    head: [['ID', 'Tipo', 'Monto', 'Estado', 'Fecha']],
    body: recientes.slice(0, 10).map((t: any) => [
      t.id, 
      t.tipo.toUpperCase(), 
      `Bs. ${Number(t.monto).toFixed(2)}`, 
      t.estado,
      new Date(t.created_at).toLocaleDateString()
    ]),
    headStyles: { fillColor: [139, 92, 246] }
  });

  doc.save(`dashboard_trifobet_${range}_${new Date().toISOString().split('T')[0]}.pdf`);
};
