import 'dart:io';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import 'package:intl/intl.dart';
import 'package:path_provider/path_provider.dart';
import 'package:permission_handler/permission_handler.dart';

class BetPdfService {
  static Future<String> generateAndDownloadPdf(
    List<dynamic> bets, {
    String? userName,
    String currencySymbol = 'Bs.',
  }) async {
    final pdf = pw.Document();
    final now = DateTime.now();
    final dateFormatter = DateFormat('dd/MM/yyyy HH:mm');

    // Dividir en páginas si es necesario (MultiPage lo maneja)
    pdf.addPage(
      pw.MultiPage(
        pageFormat: PdfPageFormat.a4,
        orientation: pw.PageOrientation.landscape, // Mejor para tablas anchas
        build: (pw.Context context) {
          return [
            _buildHeader(now, userName),
            pw.SizedBox(height: 20),
            _buildTable(bets, dateFormatter, currencySymbol),
            pw.SizedBox(height: 20),
            _buildFooter(bets, currencySymbol),
          ];
        },
      ),
    );

    final bytes = await pdf.save();
    final filename = 'historial_apuestas_${now.millisecondsSinceEpoch}.pdf';

    // 1. Guardar en dispositivo (Lógica similar a TransactionPdfService)
    String? savedPath;
    try {
      if (Platform.isAndroid) {
        var status = await Permission.storage.status;
        if (!status.isGranted) {
          status = await Permission.storage.request();
        }

        final dir = Directory('/storage/emulated/0/Download');
        if (await dir.exists()) {
          final file = File('${dir.path}/$filename');
          await file.writeAsBytes(bytes);
          savedPath = file.path;
        } else {
          final extDir = await getExternalStorageDirectory();
          if (extDir != null) {
            final file = File('${extDir.path}/$filename');
            await file.writeAsBytes(bytes);
            savedPath = file.path;
          }
        }
      } else {
        final dir = await getApplicationDocumentsDirectory();
        final file = File('${dir.path}/$filename');
        await file.writeAsBytes(bytes);
        savedPath = file.path;
      }
    } catch (e) {
      print('Error guardando archivo: $e');
    }

    // 2. Compartir
    await Printing.sharePdf(bytes: bytes, filename: filename);

    return savedPath ?? '';
  }

  static pw.Widget _buildHeader(DateTime date, String? userName) {
    return pw.Column(
      crossAxisAlignment: pw.CrossAxisAlignment.start,
      children: [
        pw.Row(
          mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
          children: [
            pw.Text(
              'TrifoBet Sports',
              style: pw.TextStyle(
                fontSize: 24,
                fontWeight: pw.FontWeight.bold,
                color: PdfColors.green,
              ),
            ),
            if (userName != null)
              pw.Text(
                'Usuario: $userName',
                style: const pw.TextStyle(fontSize: 14, color: PdfColors.black),
              ),
          ],
        ),
        pw.SizedBox(height: 8),
        pw.Text(
          'Historial de Apuestas Deportivas',
          style: pw.TextStyle(fontSize: 18, fontWeight: pw.FontWeight.bold),
        ),
        pw.Text(
          'Generado el: ${DateFormat('dd/MM/yyyy HH:mm').format(date)}',
          style: const pw.TextStyle(fontSize: 12, color: PdfColors.grey700),
        ),
        pw.Divider(),
      ],
    );
  }

  static pw.Widget _buildTable(
    List<dynamic> bets,
    DateFormat formatter,
    String currencySymbol,
  ) {
    return pw.TableHelper.fromTextArray(
      headers: [
        'Fecha',
        'Tipo',
        'Selecciones',
        'Cuota',
        'Apostado',
        'Ganancia',
        'Estado',
      ],
      data: bets.map((bet) {
        final date = DateTime.parse(bet['fechaCreacion']).toLocal();
        final selecciones = (bet['selecciones'] as List);

        // Resumen de selecciones
        String selectionsText = '';
        if (bet['tipo'] == 'simple' && selecciones.isNotEmpty) {
          selectionsText = '${selecciones[0]['seleccionDisplay']}';
        } else {
          selectionsText = '${selecciones.length} selecciones';
        }

        return [
          formatter.format(date),
          bet['tipo'] == 'simple' ? 'Simple' : 'Combinada',
          selectionsText,
          bet['cuotaTotal'].toStringAsFixed(2),
          '$currencySymbol${bet['monto']}',
          '$currencySymbol${bet['gananciaPotencial']}',
          (bet['estado'] ?? 'pendiente').toUpperCase(),
        ];
      }).toList(),
      headerStyle: pw.TextStyle(
        fontWeight: pw.FontWeight.bold,
        color: PdfColors.white,
      ),
      headerDecoration: const pw.BoxDecoration(color: PdfColors.green),
      rowDecoration: const pw.BoxDecoration(
        border: pw.Border(bottom: pw.BorderSide(color: PdfColors.grey300)),
      ),
      cellAlignment: pw.Alignment.centerLeft,
      cellAlignments: {
        3: pw.Alignment.centerRight, // Cuota
        4: pw.Alignment.centerRight, // Apostado
        5: pw.Alignment.centerRight, // Ganancia
      },
    );
  }

  static pw.Widget _buildFooter(List<dynamic> bets, String currencySymbol) {
    int total = bets.length;
    int won = 0;
    int lost = 0;
    int pending = 0;
    double totalStaked = 0;
    double totalWon = 0;

    for (var bet in bets) {
      final estado = bet['estado'] ?? 'pendiente';
      totalStaked += (bet['monto'] as num).toDouble();

      if (estado == 'ganada') {
        won++;
        totalWon += (bet['gananciaPotencial'] as num).toDouble();
      } else if (estado == 'perdida') {
        lost++;
      } else {
        pending++;
      }
    }

    double netProfit =
        totalWon -
        totalStaked; // Simplificado, idealmente solo restar stake de perdidas y sumar ganancia neta

    return pw.Column(
      crossAxisAlignment: pw.CrossAxisAlignment.end,
      children: [
        pw.Divider(),
        pw.Text(
          'Resumen General',
          style: pw.TextStyle(fontWeight: pw.FontWeight.bold),
        ),
        pw.SizedBox(height: 4),
        pw.Text(
          'Total Apuestas: $total (Ganadas: $won, Perdidas: $lost, Pendientes: $pending)',
        ),
        pw.Text(
          'Total Apostado: $currencySymbol${totalStaked.toStringAsFixed(2)}',
        ),
        pw.Text('Total Retorno: $currencySymbol${totalWon.toStringAsFixed(2)}'),
      ],
    );
  }
}
