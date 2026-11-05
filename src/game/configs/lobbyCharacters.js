// Configuración visual de los personajes que se muestran en el lobby.
// Los retratos son PNG de cuerpo completo con fondo transparente.
export const LOBBY_CHARACTERS = {
  cosa1: {
    id: 'cosa1',
    name: 'Cosa 1',
    lobbyImage: '/img/animatics-player/cosa1lobby.png',
    imageWidth: 1025,
    imageHeight: 1535,
    // Transparencia bajo los pies, como fracción de la altura de la imagen.
    feetPadding: 0.031,
    // Compensa el distinto encuadre de cada PNG para que se vean del mismo tamaño.
    lobbyScale: 1,
    ringColor: '#FF3B3B',
  },
  cosa2: {
    id: 'cosa2',
    name: 'Cosa 2',
    lobbyImage: '/img/animatics-player/cosa2lobby.png',
    imageWidth: 1018,
    imageHeight: 1545,
    feetPadding: 0.037,
    lobbyScale: 1.047,
    ringColor: '#A855F7',
  },
  cosa3: {
    id: 'cosa3',
    name: 'Cosa 3',
    lobbyImage: '/img/animatics-player/cosa3lobby.png',
    imageWidth: 1090,
    imageHeight: 1443,
    feetPadding: 0.071,
    lobbyScale: 1.103,
    ringColor: '#22C55E',
  },
}

export function getLobbyCharacter(id) {
  const key = String(id || '').toLowerCase()
  return LOBBY_CHARACTERS[key] ?? LOBBY_CHARACTERS.cosa1
}

// Todos comparten el escenario más ancho para que el aro mida igual en los tres.
const MAX_PORTRAIT_WIDTH_PER_HEIGHT = Math.max(
  ...Object.values(LOBBY_CHARACTERS).map(
    (character) => character.lobbyScale * (character.imageWidth / character.imageHeight),
  ),
)

export function getLobbyStageWidth(height) {
  return Math.round(height * MAX_PORTRAIT_WIDTH_PER_HEIGHT * 1.16)
}
