// Mapeo de nombres de equipos a sus escudos locales
const Map<String, String> teamLogos = {
  // Premier League
  'liverpool': 'assets/escudos/Liga_Inglesa/liverpool.png',
  'chelsea': 'assets/escudos/Liga_Inglesa/chelsea.png',
  'manchesterunited': 'assets/escudos/Liga_Inglesa/manchesterunited.png',
  'manutd': 'assets/escudos/Liga_Inglesa/manchesterunited.png',
  'arsenal': 'assets/escudos/Liga_Inglesa/arsenal.png',
  'manchestercity': 'assets/escudos/Liga_Inglesa/manchestercity.png',
  'mancity': 'assets/escudos/Liga_Inglesa/manchestercity.png',
  'tottenham': 'assets/escudos/Liga_Inglesa/tottenham.png',
  'tottenhamhotspur': 'assets/escudos/Liga_Inglesa/tottenham.png',
  'newcastle': 'assets/escudos/Liga_Inglesa/newcastle.png',
  'newcastleunited': 'assets/escudos/Liga_Inglesa/newcastle.png',
  'astonvilla': 'assets/escudos/Liga_Inglesa/astonvilla.png',
  'westham': 'assets/escudos/Liga_Inglesa/westham.png',
  'westhamunited': 'assets/escudos/Liga_Inglesa/westham.png',
  'brighton': 'assets/escudos/Liga_Inglesa/brighton.png',
  'brentford': 'assets/escudos/Liga_Inglesa/brentford.png',
  'crystalpalace': 'assets/escudos/Liga_Inglesa/crystalpalace.png',
  'everton': 'assets/escudos/Liga_Inglesa/everton.png',
  'fulham': 'assets/escudos/Liga_Inglesa/fulham.png',
  'nottinghamforest': 'assets/escudos/Liga_Inglesa/nottingham_forest.png',
  'wolves': 'assets/escudos/Liga_Inglesa/wolves.png',
  'wolverhampton': 'assets/escudos/Liga_Inglesa/wolves.png',
  'burnley': 'assets/escudos/Liga_Inglesa/burnley.png',
  'leeds': 'assets/escudos/Liga_Inglesa/leeds.png',
  'bournemouth': 'assets/escudos/Liga_Inglesa/bournemouth.png',

  // La Liga
  'barcelona': 'assets/escudos/Liga_Española/barcelona.png',
  'realmadrid': 'assets/escudos/Liga_Española/realmadrid.png',
  'atleticomadrid': 'assets/escudos/Liga_Española/atlmadrid.png',
  'atletico': 'assets/escudos/Liga_Española/atlmadrid.png',
  'sevilla': 'assets/escudos/Liga_Española/sevilla.png',
  'realsociedad': 'assets/escudos/Liga_Española/realsociedad.png',
  'villarreal': 'assets/escudos/Liga_Española/villarreal.png',
  'betis': 'assets/escudos/Liga_Española/betis.png',
  'realbetis': 'assets/escudos/Liga_Española/betis.png',
  'athleticclub': 'assets/escudos/Liga_Española/athletic.png',
  'athleticbilbao': 'assets/escudos/Liga_Española/athletic.png',
  'valencia': 'assets/escudos/Liga_Española/valencia.png',
  'osasuna': 'assets/escudos/Liga_Española/osasuna.png',
  'girona': 'assets/escudos/Liga_Española/girona.png',
  'rayovallecano': 'assets/escudos/Liga_Española/rayovallecano.png',
  'mallorca': 'assets/escudos/Liga_Española/mallorca.png',
  'celtavigo': 'assets/escudos/Liga_Española/celta.png', // Asumido
  'almeria': 'assets/escudos/Liga_Española/almeria.png', // Asumido
  'cadiz': 'assets/escudos/Liga_Española/cadiz.png', // Asumido
  'getafe': 'assets/escudos/Liga_Española/getafe.png',
  'espanyol': 'assets/escudos/Liga_Española/espanyol.png',
  'elche': 'assets/escudos/Liga_Española/elche.png',
  'alaves': 'assets/escudos/Liga_Española/alaves.png',
  'levante': 'assets/escudos/Liga_Española/levante.png',

  // Serie A
  'juventus': 'assets/escudos/Liga_Italiana/juventus.png',
  'inter': 'assets/escudos/Liga_Italiana/inter.png',
  'intermilan': 'assets/escudos/Liga_Italiana/inter.png',
  'milan': 'assets/escudos/Liga_Italiana/milan.png',
  'acmilan': 'assets/escudos/Liga_Italiana/milan.png',
  'napoli': 'assets/escudos/Liga_Italiana/napoli.png',
  'roma': 'assets/escudos/Liga_Italiana/roma.png',
  'lazio': 'assets/escudos/Liga_Italiana/lazio.png',
  'atalanta': 'assets/escudos/Liga_Italiana/atalanta.png',
  'fiorentina': 'assets/escudos/Liga_Italiana/fiorentina.png',
  'torino': 'assets/escudos/Liga_Italiana/torino.png',
  'bologna': 'assets/escudos/Liga_Italiana/bologna.png',
  'udinese': 'assets/escudos/Liga_Italiana/udinese.png',
  'sassuolo': 'assets/escudos/Liga_Italiana/sassuolo.png',
  'lecce': 'assets/escudos/Liga_Italiana/lecce.png',
  'monza': 'assets/escudos/Liga_Italiana/monza.png', // Asumido
  'empoli': 'assets/escudos/Liga_Italiana/empoli.png', // Asumido
  'salernitana': 'assets/escudos/Liga_Italiana/salernitana.png', // Asumido
  'verona': 'assets/escudos/Liga_Italiana/hellasverona.png',
  'hellasverona': 'assets/escudos/Liga_Italiana/hellasverona.png',
  'cremonese': 'assets/escudos/Liga_Italiana/cremonese.png',
  'sampdoria': 'assets/escudos/Liga_Italiana/sampdoria.png', // Asumido
  'spezia': 'assets/escudos/Liga_Italiana/spezia.png', // Asumido
  'cagliari': 'assets/escudos/Liga_Italiana/cagliari.png',
  'genoa': 'assets/escudos/Liga_Italiana/genoa.png',
  'parma': 'assets/escudos/Liga_Italiana/parma.png',

  // Bundesliga
  'bayernmunich': 'assets/escudos/Liga_Alemana/bayernmunchen.png',
  'bayernmunchen': 'assets/escudos/Liga_Alemana/bayernmunchen.png',
  'borussiadortmund': 'assets/escudos/Liga_Alemana/borussiadortmund.png',
  'dortmund': 'assets/escudos/Liga_Alemana/borussiadortmund.png',
  'rbleipzig': 'assets/escudos/Liga_Alemana/rbleipzig.png',
  'leipzig': 'assets/escudos/Liga_Alemana/rbleipzig.png',
  'unionberlin': 'assets/escudos/Liga_Alemana/unionberlin.png', // Asumido
  'freiburg': 'assets/escudos/Liga_Alemana/freiburg.png', // Asumido
  'bayerleverkusen':
      'assets/escudos/Liga_Alemana/bayerleverkusen.png', // Asumido
  'leverkusen': 'assets/escudos/Liga_Alemana/bayerleverkusen.png', // Asumido
  'eintrachtfrankfurt':
      'assets/escudos/Liga_Alemana/eintrachtfrankfurt.png', // Asumido
  'wolfsburg': 'assets/escudos/Liga_Alemana/wolfsburg.png', // Asumido
  'mainz': 'assets/escudos/Liga_Alemana/mainz05.png', // Asumido
  'borussiamonchengladbach':
      'assets/escudos/Liga_Alemana/borussiamonchengladbach.png', // Asumido
  'monchengladbach':
      'assets/escudos/Liga_Alemana/borussiamonchengladbach.png', // Asumido
  // Ligue 1
  'psg': 'assets/escudos/Liga_Francesa/psg.png',
  'parissaintgermain': 'assets/escudos/Liga_Francesa/psg.png',
  'marseille': 'assets/escudos/Liga_Francesa/marseille.png', // Asumido
  'lens': 'assets/escudos/Liga_Francesa/lens.png', // Asumido
  'monaco': 'assets/escudos/Liga_Francesa/monaco.png', // Asumido
  'lille': 'assets/escudos/Liga_Francesa/lille.png', // Asumido
  'rennes': 'assets/escudos/Liga_Francesa/rennes.png', // Asumido
  'lyon': 'assets/escudos/Liga_Francesa/lyon.png', // Asumido
  'olympiquelyonnais': 'assets/escudos/Liga_Francesa/lyon.png', // Asumido
  // Argentina
  'riverplate': 'assets/escudos/Liga_Argentina/river.png',
  'river': 'assets/escudos/Liga_Argentina/river.png',
  'bocajuniors': 'assets/escudos/Liga_Argentina/boca.png',
  'boca': 'assets/escudos/Liga_Argentina/boca.png',
  'racingclub': 'assets/escudos/Liga_Argentina/racing.png', // Asumido
  'independiente': 'assets/escudos/Liga_Argentina/independiente.png', // Asumido
  'sanlorenzo': 'assets/escudos/Liga_Argentina/sanlorenzo.png', // Asumido
  // Brasil
  'flamengo': 'assets/escudos/Liga_Brazileira/flamengo.png',
  'palmeiras': 'assets/escudos/Liga_Brazileira/palmeiras.png',
  'corinthians': 'assets/escudos/Liga_Brazileira/corinthians.png', // Asumido
  'saopaulo': 'assets/escudos/Liga_Brazileira/saopaulo.png', // Asumido
  'santos': 'assets/escudos/Liga_Brazileira/santos.png', // Asumido
  'gremio': 'assets/escudos/Liga_Brazileira/gremio.png', // Asumido
  // Eredivisie
  'ajax': 'assets/escudos/ChampionsLeague/ajax.png',
  'feyenoord': 'assets/escudos/Liga_Holandesa/feyenoord.png',
  'psv': 'assets/escudos/Liga_Holandesa/psv.png', // Asumido
};

// Función helper para buscar el logo de un equipo
String? getTeamLogo(String teamName) {
  // Normalización agresiva
  final normalized = teamName
      .toLowerCase()
      .replaceAll(' ', '')
      .replaceAll('-', '')
      .replaceAll('.', '')
      .replaceAll('fc', '') // Eliminar FC común
      .replaceAll('cf', '') // Eliminar CF común
      .replaceAll('é', 'e')
      .replaceAll('á', 'a')
      .replaceAll('í', 'i')
      .replaceAll('ó', 'o')
      .replaceAll('ú', 'u')
      .replaceAll('ñ', 'n');

  return teamLogos[normalized];
}
