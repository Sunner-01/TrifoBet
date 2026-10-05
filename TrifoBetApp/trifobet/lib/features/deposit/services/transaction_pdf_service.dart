import 'dart:io';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import 'package:intl/intl.dart';
import 'package:path_provider/path_provider.dart';
import 'package:permission_handler/permission_handler.dart';
import '../models/transaction_model.dart';

class TransactionPdfService {
  static Future<String> generateAndDownloadPdf(
    List<TransactionModel> transactions, {
    String? userName,
    String currencySymbol = 'Bs.',
  }) async {
    final pdf = pw.Document();
    final now = DateTime.now();
    final dateFormatter = DateFormat('dd/MM/yyyy HH:mm');

    pdf.addPage(
      pw.MultiPage(
        pageFormat: PdfPageFormat.a4,
        build: (pw.Context context) {
          return [
            _buildHeader(now, userName),
            pw.SizedBox(height: 20),
            _buildTable(transactions, dateFormatter, currencySymbol),
            pw.SizedBox(height: 20),
            _buildFooter(transactions, currencySymbol),
          ];
        },
      ),
    );

    final bytes = await pdf.save();
    final filename =
        'historial_transacciones_${now.millisecondsSinceEpoch}.pdf';

    // 1. Guardar en dispositivo
    String? savedPath;
    try {
      if (Platform.isAndroid) {
        // Solicitar permisos si es necesario (Android < 10)
        var status = await Permission.storage.status;
        if (!status.isGranted) {
          status = await Permission.storage.request();
        }

        // Intentar guardar en Descargas
        final dir = Directory('/storage/emulated/0/Download');
        if (await dir.exists()) {
          final file = File('${dir.path}/$filename');
          await file.writeAsBytes(bytes);
          savedPath = file.path;
        } else {
          // Fallback
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

    // 2. Compartir (esto también permite "Guardar en archivos" en iOS/Android)
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
              'TrifoBet',
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
          'Historial de Transacciones',
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
    List<TransactionModel> transactions,
    DateFormat formatter,
    String currencySymbol,
  ) {
    return pw.TableHelper.fromTextArray(
      headers: ['Fecha', 'Tipo', 'Monto', 'Estado', 'Método'],
      data: transactions.map((t) {
        return [
          formatter.format(t.createdAt),
          t.isDeposit ? 'Depósito' : 'Retiro',
          '$currencySymbol${t.amount.toStringAsFixed(2)}',
          t.statusLabel,
          t.financialEntity?.name ?? t.paymentMethod?.name ?? '-',
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
        2: pw.Alignment.centerRight, // Monto a la derecha
      },
    );
  }

  static pw.Widget _buildFooter(
    List<TransactionModel> transactions,
    String currencySymbol,
  ) {
    final totalDeposits = transactions
        .where(
          (t) =>
              t.isDeposit &&
              (t.status.toLowerCase() == 'completado' ||
                  t.status.toLowerCase() == 'aprobado'),
        )
        .fold(0.0, (sum, t) => sum + t.amount);

    final totalWithdrawals = transactions
        .where(
          (t) =>
              t.isWithdrawal &&
              (t.status.toLowerCase() == 'completado' ||
                  t.status.toLowerCase() == 'aprobado'),
        )
        .fold(0.0, (sum, t) => sum + t.amount);

    return pw.Column(
      crossAxisAlignment: pw.CrossAxisAlignment.end,
      children: [
        pw.Divider(),
        pw.Text(
          'Resumen (Completados/Aprobados)',
          style: pw.TextStyle(fontWeight: pw.FontWeight.bold),
        ),
        pw.SizedBox(height: 4),
        pw.Text(
          'Total Depósitos: $currencySymbol${totalDeposits.toStringAsFixed(2)}',
        ),
        pw.Text(
          'Total Retiros: $currencySymbol${totalWithdrawals.toStringAsFixed(2)}',
        ),
      ],
    );
  }
}
