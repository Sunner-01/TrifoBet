import 'dart:io';

void main() async {
  final dir = Directory(
    'c:/Proyecto Integrador/TrifoBetApp/trifobet/assets/escudos',
  );
  if (!dir.existsSync()) {
    print('Directory not found');
    return;
  }

  final files = dir.listSync(recursive: true).whereType<File>();
  final Map<String, String> teamMap = {};

  for (var file in files) {
    if (file.path.endsWith('.png') ||
        file.path.endsWith('.jpg') ||
        file.path.endsWith('.jpeg')) {
      final pathParts = file.path.split(Platform.pathSeparator);
      final fileName = pathParts.last;
      final teamName = fileName.split('.').first.toLowerCase();

      // Find the index of 'escudos' to build the relative path
      final escudosIndex = pathParts.indexOf('escudos');
      if (escudosIndex != -1) {
        final relativePath = pathParts.sublist(escudosIndex + 1).join('/');
        final assetPath = 'assets/escudos/$relativePath';
        teamMap[teamName] = assetPath;
      }
    }
  }

  final outputFile = File(
    'c:/Proyecto Integrador/TrifoBetApp/trifobet/lib/features/sports/services/team_logos.dart',
  );
  final sink = outputFile.openWrite();

  sink.writeln('const Map<String, String> teamLogos = {');
  teamMap.forEach((key, value) {
    sink.writeln("  '$key': '$value',");
  });
  sink.writeln('};');

  await sink.close();
  print('File generated at ${outputFile.path}');
}
