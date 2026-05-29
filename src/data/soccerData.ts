import { SoccerPlayer, DifficultyTier } from '../types/game';

export type { DifficultyTier };

const ISRAELI_CLUBS = [
  'Maccabi Haifa',
  'Maccabi Tel Aviv',
  'Hapoel Tel Aviv',
  'Beitar Jerusalem',
  'Hapoel Beer Sheva',
  'Bnei Yehuda',
  'Hapoel Haifa',
  'Hapoel Petah Tikva',
  'Maccabi Petah Tikva',
  'Ironi Kiryat Shmona',
];

export const soccerPlayers: SoccerPlayer[] = [
  // Tier 1 — household names in Israeli football
  { name: 'Eli Ohana', team: 'Beitar Jerusalem', otherTeams: ISRAELI_CLUBS, tier: 1 },
  { name: 'Yossi Benayoun', team: 'Maccabi Haifa', otherTeams: ISRAELI_CLUBS, tier: 1 },
  { name: 'Eyal Berkovic', team: 'Maccabi Haifa', otherTeams: ISRAELI_CLUBS, tier: 1 },
  { name: 'Ronnie Rosenthal', team: 'Maccabi Haifa', otherTeams: ISRAELI_CLUBS, tier: 1 },
  { name: 'Avi Nimni', team: 'Maccabi Tel Aviv', otherTeams: ISRAELI_CLUBS, tier: 1 },
  { name: 'Haim Revivo', team: 'Hapoel Tel Aviv', otherTeams: ISRAELI_CLUBS, tier: 1 },

  // Tier 2 — well known to fans
  { name: 'Tal Banin', team: 'Maccabi Haifa', otherTeams: ISRAELI_CLUBS, tier: 2 },
  { name: 'Idan Tal', team: 'Maccabi Haifa', otherTeams: ISRAELI_CLUBS, tier: 2 },
  { name: 'Walid Badir', team: 'Hapoel Tel Aviv', otherTeams: ISRAELI_CLUBS, tier: 2 },
  { name: 'Yaniv Katan', team: 'Maccabi Haifa', otherTeams: ISRAELI_CLUBS, tier: 2 },
  { name: 'Salim Tuama', team: 'Hapoel Tel Aviv', otherTeams: ISRAELI_CLUBS, tier: 2 },
  { name: 'Arik Benado', team: 'Maccabi Haifa', otherTeams: ISRAELI_CLUBS, tier: 2 },

  // Tier 3 — deeper cuts
  { name: 'Giovanni Rosso', team: 'Maccabi Haifa', otherTeams: ISRAELI_CLUBS, tier: 3 },
  { name: 'Alon Mizrahi', team: 'Maccabi Haifa', otherTeams: ISRAELI_CLUBS, tier: 3 },
  { name: 'Eli Driks', team: 'Hapoel Tel Aviv', otherTeams: ISRAELI_CLUBS, tier: 3 },
  { name: 'Reuven Atar', team: 'Hapoel Haifa', otherTeams: ISRAELI_CLUBS, tier: 3 },
  { name: 'Uri Malmilian', team: 'Beitar Jerusalem', otherTeams: ISRAELI_CLUBS, tier: 3 },
  { name: 'Mordechai Spiegler', team: 'Maccabi Netanya', otherTeams: [...ISRAELI_CLUBS, 'Maccabi Netanya'], tier: 3 },
];
