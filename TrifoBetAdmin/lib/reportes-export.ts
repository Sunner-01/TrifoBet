import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';

export const exportToPDF = (title: string, tableId: string, startDate?: string, endDate?: string) => {
  const doc = new jsPDF();
  doc.text(`Reporte: ${title}`, 14, 15);
  doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 25);
  if (startDate && endDate) {
    doc.text(`Periodo: ${startDate} al ${endDate}`, 14, 30);
  }
  
  autoTable(doc, {
    html: `#${tableId}`,
    startY: (startDate && endDate) ? 35 : 30,
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [0, 168, 132] }
  });
  
  doc.save(`${title.replace(/ /g, '_').toLowerCase()}.pdf`);
};

export const exportToExcelWithChart = async (title: string, tableId: string, chartContainerId?: string, startDate?: string, endDate?: string) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte');
    
    worksheet.addRow([`Reporte: ${title}`]);
    worksheet.addRow([`Generado: ${new Date().toLocaleDateString()}`]);
    if (startDate && endDate) worksheet.addRow([`Periodo: ${startDate} al ${endDate}`]);
    worksheet.addRow([]);

    const table = document.getElementById(tableId) as HTMLTableElement;
    if (table) {
      const rows = Array.from(table.querySelectorAll('tr'));
      rows.forEach((row, rowIndex) => {
        const cells = Array.from(row.querySelectorAll('th, td'));
        const rowData = cells.map(cell => cell.textContent?.trim() || '');
        const newRow = worksheet.addRow(rowData);
        
        if (rowIndex === 0) {
          newRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
          newRow.eachCell(c => {
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00A884' } };
          });
        }
      });
    }

    worksheet.columns.forEach(column => { column.width = 25; });

    if (chartContainerId) {
      const chartElement = document.getElementById(chartContainerId);
      if (chartElement) {
        const canvas = await html2canvas(chartElement);
        const base64Image = canvas.toDataURL('image/png');
        const imageId = workbook.addImage({ base64: base64Image, extension: 'png' });
        worksheet.addImage(imageId, {
          tl: { col: 0, row: worksheet.rowCount + 2 },
          ext: { width: canvas.width * 0.7, height: canvas.height * 0.7 }
        });
      }
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${title.replace(/ /g, '_').toLowerCase()}.xlsx`);
  } catch (e) {
    console.error('Error exportando Excel', e);
  }
};
