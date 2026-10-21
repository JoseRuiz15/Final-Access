import { db } from './pool.js';
import { missions } from './schema.js';
import { pathToFileURL } from 'node:url';
import { sql } from './pool.js';

const MISIONES_BASE = [
  {
    title: 'Juega 2 partidas',
    description: 'Completa 2 partidas de cualquier nivel.',
    missionType: 'play_matches' as const,
    targetValue: 2,
    rewardCoins: 50,
    rewardXp: 100,
    isDaily: true,
  },
  {
    title: 'Elimina 10 enemigos',
    description: 'Derrota a 10 enemigos en total.',
    missionType: 'kill_enemies' as const,
    targetValue: 10,
    rewardCoins: 75,
    rewardXp: 150,
    isDaily: true,
  },
  {
    title: 'Gana 1 partida',
    description: 'Completa un nivel con éxito.',
    missionType: 'win_matches' as const,
    targetValue: 1,
    rewardCoins: 100,
    rewardXp: 200,
    isDaily: true,
  },
  {
    title: 'Recoge 3 llaves',
    description: 'Consigue 3 llaves de los niveles.',
    missionType: 'collect_keys' as const,
    targetValue: 3,
    rewardCoins: 60,
    rewardXp: 120,
    isDaily: true,
  },
  {
    title: 'Supera 1 nivel',
    description: 'Termina cualquier nivel del mapa.',
    missionType: 'complete_level' as const,
    targetValue: 1,
    rewardCoins: 80,
    rewardXp: 160,
    isDaily: true,
  },
];

export async function seedMissions() {
  const existing = await db.select().from(missions).limit(1);
  if (existing.length > 0) {
    console.log('Missions already seeded');
    return;
  }

  await db.insert(missions).values(MISIONES_BASE);

  console.log('✅ Missions seeded successfully');
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  await seedMissions();
  await sql.end({ timeout: 5 });
  process.exit(0);
}
