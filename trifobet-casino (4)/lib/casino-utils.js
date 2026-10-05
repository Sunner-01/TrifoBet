export const CATEGORIES = [
  'Todos',
  'Tragamonedas',
  'Crash Games',
  'Ruleta',
  'Blackjack',
  'Slots',
  'Mesa',
  'Instantáneo'
];

export const LOCAL_THUMBNAILS = {
  'blackjack': '/juegos/Blackjack.png',
  'tragamonedas': '/juegos/Tragamonedas.png',
  'nebula': '/juegos/NebulaGame.png',
  'penalty': '/juegos/Penalty.png',
  'lightning roulette': '/juegos/Ruleta.png',
  'plinko': '/juegos/Plinko_Game.png',
  'chicken': '/juegos/ChickenRoad.png'
};

export const getGameImage = (game) => {
  if (game.imagen_url) return game.imagen_url;
  
  const nombreLower = game.nombre.toLowerCase();
  for (const [key, path] of Object.entries(LOCAL_THUMBNAILS)) {
    if (nombreLower.includes(key)) return path;
  }
  
  return '/juegos/Blackjack.png';
};
