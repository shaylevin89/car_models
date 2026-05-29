import { SoccerPlayer, DifficultyTier } from '../types/game';

export type { DifficultyTier };

// The full pool of Israeli clubs used to build distractor options.
// Every club that appears as a "correct" team for any player MUST also appear
// here, otherwise the complement logic below could miss it.
const ALL_CLUBS = [
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
  'Maccabi Netanya',
  'Bnei Sakhnin',
  'Hapoel Ramat Gan',
  'Hapoel Kfar Saba',
];

// A player's `playedAt` lists every Israeli senior club they ever represented
// (verified against Wikipedia career tables). `otherTeams` is derived as
// ALL_CLUBS \ playedAt so each of the 3 distractors is guaranteed to be a club
// the player never played for — exactly one option (the correct team) is real.
interface PlayerRecord {
  name: string;
  team: string;        // canonical correct answer (must be inside playedAt)
  playedAt: string[];  // every Israeli senior club the player represented
  tier: DifficultyTier;
}

function buildOtherTeams(playedAt: string[]): string[] {
  return ALL_CLUBS.filter(c => !playedAt.includes(c));
}

const records: PlayerRecord[] = [
  // ─────────────────────── Tier 1 — household names ───────────────────────
  { name: 'Eli Ohana',          team: 'Beitar Jerusalem',  playedAt: ['Beitar Jerusalem'], tier: 1 },
  { name: 'Yossi Benayoun',     team: 'Maccabi Haifa',     playedAt: ['Hapoel Beer Sheva', 'Maccabi Haifa', 'Maccabi Tel Aviv', 'Beitar Jerusalem', 'Maccabi Petah Tikva'], tier: 1 },
  { name: 'Eyal Berkovic',      team: 'Maccabi Haifa',     playedAt: ['Maccabi Haifa', 'Maccabi Tel Aviv'], tier: 1 },
  { name: 'Ronnie Rosenthal',   team: 'Maccabi Haifa',     playedAt: ['Maccabi Haifa'], tier: 1 },
  { name: 'Avi Nimni',          team: 'Maccabi Tel Aviv',  playedAt: ['Maccabi Tel Aviv'], tier: 1 },
  { name: 'Haim Revivo',        team: 'Hapoel Tel Aviv',   playedAt: ['Bnei Yehuda', 'Hapoel Tel Aviv', 'Maccabi Haifa'], tier: 1 },
  { name: 'Eran Zahavi',        team: 'Maccabi Tel Aviv',  playedAt: ['Hapoel Tel Aviv', 'Maccabi Tel Aviv'], tier: 1 },
  { name: 'Tal Ben Haim',       team: 'Maccabi Tel Aviv',  playedAt: ['Maccabi Tel Aviv', 'Beitar Jerusalem'], tier: 1 },
  { name: 'Uri Malmilian',      team: 'Beitar Jerusalem',  playedAt: ['Beitar Jerusalem'], tier: 1 },
  { name: 'Mordechai Spiegler', team: 'Maccabi Netanya',   playedAt: ['Maccabi Netanya'], tier: 1 },
  { name: 'Avi Cohen',          team: 'Maccabi Tel Aviv',  playedAt: ['Maccabi Tel Aviv', 'Maccabi Netanya'], tier: 1 },
  { name: 'Itzhak Shum',        team: 'Hapoel Kfar Saba',  playedAt: ['Hapoel Kfar Saba'], tier: 1 },
  { name: 'Tal Banin',          team: 'Hapoel Haifa',      playedAt: ['Hapoel Haifa', 'Maccabi Haifa', 'Maccabi Tel Aviv', 'Bnei Yehuda', 'Beitar Jerusalem', 'Maccabi Netanya'], tier: 1 },
  { name: 'Bibras Natkho',      team: 'Hapoel Tel Aviv',   playedAt: ['Hapoel Tel Aviv'], tier: 1 },
  { name: 'Yaniv Katan',        team: 'Maccabi Haifa',     playedAt: ['Maccabi Haifa'], tier: 1 },
  { name: 'Arik Benado',        team: 'Maccabi Haifa',     playedAt: ['Maccabi Haifa', 'Beitar Jerusalem'], tier: 1 },
  { name: 'Walid Badir',        team: 'Hapoel Tel Aviv',   playedAt: ['Hapoel Petah Tikva', 'Maccabi Haifa', 'Hapoel Tel Aviv'], tier: 1 },
  { name: 'Idan Tal',           team: 'Maccabi Haifa',     playedAt: ['Maccabi Petah Tikva', 'Hapoel Tel Aviv', 'Maccabi Haifa', 'Beitar Jerusalem'], tier: 1 },
  { name: 'Dudu Aouate',        team: 'Maccabi Haifa',     playedAt: ['Maccabi Haifa', 'Maccabi Tel Aviv', 'Hapoel Haifa'], tier: 1 },
  { name: 'Tomer Hemed',        team: 'Maccabi Haifa',     playedAt: ['Maccabi Haifa', 'Hapoel Beer Sheva'], tier: 1 },
  { name: 'Salim Tuama',        team: 'Hapoel Tel Aviv',   playedAt: ['Hapoel Tel Aviv', 'Maccabi Petah Tikva'], tier: 1 },
  { name: 'Alon Mizrahi',       team: 'Maccabi Haifa',     playedAt: ['Bnei Yehuda', 'Hapoel Tel Aviv', 'Maccabi Haifa', 'Maccabi Tel Aviv', 'Beitar Jerusalem', 'Hapoel Kfar Saba', 'Hapoel Beer Sheva'], tier: 1 },
  { name: 'Itay Shechter',      team: 'Hapoel Tel Aviv',   playedAt: ['Maccabi Netanya', 'Hapoel Tel Aviv', 'Maccabi Haifa', 'Beitar Jerusalem', 'Maccabi Tel Aviv', 'Hapoel Beer Sheva', 'Hapoel Petah Tikva'], tier: 1 },
  { name: 'Beram Kayal',        team: 'Maccabi Haifa',     playedAt: ['Maccabi Haifa', 'Bnei Sakhnin'], tier: 1 },
  { name: 'Manor Solomon',      team: 'Maccabi Petah Tikva', playedAt: ['Maccabi Petah Tikva'], tier: 1 },
  { name: 'Munas Dabbur',       team: 'Maccabi Tel Aviv',  playedAt: ['Maccabi Tel Aviv'], tier: 1 },
  { name: 'Lior Refaelov',      team: 'Maccabi Haifa',     playedAt: ['Maccabi Haifa'], tier: 1 },
  { name: 'Eli Dasa',           team: 'Maccabi Tel Aviv',  playedAt: ['Beitar Jerusalem', 'Maccabi Tel Aviv'], tier: 1 },
  { name: 'Alon Harazi',        team: 'Maccabi Haifa',     playedAt: ['Maccabi Haifa', 'Beitar Jerusalem'], tier: 1 },
  { name: 'Nahum Stelmach',     team: 'Hapoel Petah Tikva', playedAt: ['Hapoel Petah Tikva', 'Bnei Yehuda'], tier: 1 },

  // ─────────────────────── Tier 2 — well known to fans ────────────────────
  { name: 'Giora Spiegel',      team: 'Maccabi Tel Aviv',  playedAt: ['Maccabi Tel Aviv'], tier: 2 },
  { name: 'Vicky Peretz',       team: 'Maccabi Tel Aviv',  playedAt: ['Maccabi Tel Aviv'], tier: 2 },
  { name: 'Bonni Ginzburg',     team: 'Maccabi Tel Aviv',  playedAt: ['Maccabi Tel Aviv', 'Maccabi Petah Tikva', 'Maccabi Haifa', 'Beitar Jerusalem', 'Bnei Yehuda', 'Hapoel Kfar Saba'], tier: 2 },
  { name: 'Shimon Gershon',     team: 'Hapoel Tel Aviv',   playedAt: ['Hapoel Tel Aviv', 'Beitar Jerusalem'], tier: 2 },
  { name: 'Reuven Atar',        team: 'Hapoel Haifa',      playedAt: ['Maccabi Haifa', 'Hapoel Haifa', 'Beitar Jerusalem', 'Hapoel Petah Tikva', 'Maccabi Netanya'], tier: 2 },
  { name: 'Itzik Zohar',        team: 'Maccabi Tel Aviv',  playedAt: ['Maccabi Tel Aviv', 'Beitar Jerusalem', 'Maccabi Haifa', 'Maccabi Netanya'], tier: 2 },
  { name: 'Nir Klinger',        team: 'Maccabi Tel Aviv',  playedAt: ['Maccabi Haifa', 'Maccabi Tel Aviv'], tier: 2 },
  { name: 'Giovanni Rosso',     team: 'Maccabi Haifa',     playedAt: ['Hapoel Beer Sheva', 'Hapoel Haifa', 'Beitar Jerusalem', 'Maccabi Haifa', 'Maccabi Tel Aviv'], tier: 2 },
  { name: 'Itzhak Vissoker',    team: 'Hapoel Petah Tikva', playedAt: ['Hapoel Petah Tikva', 'Maccabi Netanya'], tier: 2 },
  { name: 'Alon Hazan',         team: 'Maccabi Haifa',     playedAt: ['Hapoel Petah Tikva', 'Maccabi Haifa', 'Hapoel Tel Aviv'], tier: 2 },
  { name: 'Nir Davidovich',     team: 'Maccabi Haifa',     playedAt: ['Maccabi Haifa'], tier: 2 },
  { name: 'Yehoshua Feigenbaum', team: 'Hapoel Tel Aviv',  playedAt: ['Hapoel Tel Aviv', 'Hapoel Haifa'], tier: 2 },
  { name: 'Moshe Sinai',        team: 'Hapoel Tel Aviv',   playedAt: ['Hapoel Tel Aviv', 'Bnei Yehuda'], tier: 2 },
  { name: 'Adoram Keisi',       team: 'Maccabi Haifa',     playedAt: ['Hapoel Petah Tikva', 'Maccabi Haifa'], tier: 2 },
  { name: 'Ronen Harazi',       team: 'Maccabi Haifa',     playedAt: ['Hapoel Ramat Gan', 'Beitar Jerusalem', 'Hapoel Haifa', 'Maccabi Haifa', 'Hapoel Tel Aviv'], tier: 2 },
  { name: 'Ben Sahar',          team: 'Hapoel Tel Aviv',   playedAt: ['Hapoel Tel Aviv', 'Hapoel Beer Sheva', 'Maccabi Haifa', 'Maccabi Petah Tikva'], tier: 2 },
  { name: 'Elyaniv Barda',      team: 'Hapoel Beer Sheva', playedAt: ['Hapoel Beer Sheva', 'Maccabi Haifa', 'Hapoel Tel Aviv'], tier: 2 },
  { name: 'Omer Damari',        team: 'Hapoel Tel Aviv',   playedAt: ['Maccabi Petah Tikva', 'Hapoel Tel Aviv', 'Maccabi Haifa'], tier: 2 },
  { name: 'Roberto Colautti',   team: 'Maccabi Haifa',     playedAt: ['Maccabi Haifa', 'Maccabi Tel Aviv'], tier: 2 },
  { name: 'Omer Atzili',        team: 'Maccabi Haifa',     playedAt: ['Beitar Jerusalem', 'Maccabi Tel Aviv', 'Maccabi Haifa'], tier: 2 },
  { name: 'Tamir Cohen',        team: 'Maccabi Tel Aviv',  playedAt: ['Maccabi Tel Aviv', 'Maccabi Netanya', 'Maccabi Haifa'], tier: 2 },
  { name: 'Dor Peretz',         team: 'Maccabi Tel Aviv',  playedAt: ['Maccabi Tel Aviv', 'Hapoel Haifa'], tier: 2 },
  { name: 'Gal Alberman',       team: 'Maccabi Tel Aviv',  playedAt: ['Maccabi Petah Tikva', 'Beitar Jerusalem', 'Maccabi Tel Aviv', 'Maccabi Haifa'], tier: 2 },
  { name: 'Yossi Abukasis',     team: 'Hapoel Tel Aviv',   playedAt: ['Hapoel Tel Aviv', 'Bnei Yehuda', 'Beitar Jerusalem'], tier: 2 },
  { name: 'Sheran Yeini',       team: 'Maccabi Tel Aviv',  playedAt: ['Maccabi Tel Aviv'], tier: 2 },
  { name: 'Klemi Saban',        team: 'Maccabi Netanya',   playedAt: ['Maccabi Netanya', 'Hapoel Tel Aviv', 'Hapoel Petah Tikva', 'Maccabi Haifa', 'Maccabi Tel Aviv', 'Hapoel Beer Sheva'], tier: 2 },
  { name: 'Maor Buzaglo',       team: 'Maccabi Tel Aviv',  playedAt: ['Maccabi Haifa', 'Hapoel Petah Tikva', 'Bnei Sakhnin', 'Maccabi Tel Aviv', 'Hapoel Beer Sheva', 'Beitar Jerusalem', 'Hapoel Tel Aviv'], tier: 2 },
  { name: 'Liel Abada',         team: 'Maccabi Petah Tikva', playedAt: ['Maccabi Petah Tikva'], tier: 2 },
  { name: 'Dean David',         team: 'Maccabi Haifa',     playedAt: ['Maccabi Haifa'], tier: 2 },
  { name: 'Itzik Kornfein',     team: 'Beitar Jerusalem',  playedAt: ['Beitar Jerusalem', 'Hapoel Petah Tikva'], tier: 2 },
  { name: 'Daniel Brailovsky',  team: 'Maccabi Haifa',     playedAt: ['Maccabi Haifa'], tier: 2 },
  { name: 'Maor Melikson',      team: 'Maccabi Haifa',     playedAt: ['Beitar Jerusalem', 'Maccabi Haifa', 'Hapoel Kfar Saba', 'Hapoel Beer Sheva'], tier: 2 },
  { name: 'Nir Bitton',         team: 'Maccabi Tel Aviv',  playedAt: ['Maccabi Tel Aviv'], tier: 2 },
  { name: 'Ofir Marciano',      team: 'Hapoel Beer Sheva', playedAt: ['Hapoel Beer Sheva'], tier: 2 },
  { name: 'Dekel Keinan',       team: 'Maccabi Haifa',     playedAt: ['Maccabi Haifa', 'Bnei Sakhnin', 'Maccabi Netanya'], tier: 2 },

  // ─────────────────────── Tier 3 — deeper cuts ───────────────────────────
  { name: 'Eitan Tibi',         team: 'Beitar Jerusalem',  playedAt: ['Beitar Jerusalem', 'Ironi Kiryat Shmona', 'Maccabi Tel Aviv', 'Hapoel Beer Sheva'], tier: 3 },
  { name: 'Yoav Ziv',           team: 'Maccabi Haifa',     playedAt: ['Maccabi Haifa', 'Hapoel Haifa', 'Beitar Jerusalem', 'Maccabi Tel Aviv', 'Hapoel Petah Tikva'], tier: 3 },
  { name: 'David Pizanti',      team: 'Maccabi Netanya',   playedAt: ['Maccabi Netanya', 'Hapoel Tel Aviv', 'Hapoel Haifa', 'Hapoel Petah Tikva'], tier: 3 },
  { name: 'Pini Balili',        team: 'Hapoel Tel Aviv',   playedAt: ['Hapoel Tel Aviv', 'Bnei Yehuda'], tier: 3 },
  { name: 'Zahi Armeli',        team: 'Maccabi Haifa',     playedAt: ['Maccabi Haifa', 'Hapoel Haifa'], tier: 3 },
  { name: 'Dedi Ben Dayan',     team: 'Hapoel Tel Aviv',   playedAt: ['Maccabi Tel Aviv', 'Hapoel Petah Tikva', 'Hapoel Kfar Saba', 'Hapoel Beer Sheva', 'Maccabi Netanya', 'Hapoel Tel Aviv', 'Bnei Sakhnin', 'Maccabi Petah Tikva'], tier: 3 },
  { name: 'Omri Afek',          team: 'Maccabi Haifa',     playedAt: ['Hapoel Tel Aviv', 'Beitar Jerusalem', 'Maccabi Haifa', 'Bnei Yehuda'], tier: 3 },
  { name: 'Eli Driks',          team: 'Maccabi Tel Aviv',  playedAt: ['Maccabi Tel Aviv', 'Maccabi Netanya'], tier: 3 },
  { name: 'David Primo',        team: 'Hapoel Tel Aviv',   playedAt: ['Hapoel Tel Aviv', 'Hapoel Ramat Gan'], tier: 3 },
  { name: 'Omer Golan',         team: 'Maccabi Petah Tikva', playedAt: ['Maccabi Petah Tikva'], tier: 3 },
  { name: 'Shmuel Rosenthal',   team: 'Hapoel Petah Tikva', playedAt: ['Hapoel Petah Tikva'], tier: 3 },
  { name: 'Felix Halfon',       team: 'Hapoel Tel Aviv',   playedAt: ['Hapoel Tel Aviv', 'Maccabi Tel Aviv', 'Hapoel Haifa', 'Beitar Jerusalem', 'Bnei Yehuda'], tier: 3 },
  { name: 'Michael Zandberg',   team: 'Hapoel Tel Aviv',   playedAt: ['Hapoel Petah Tikva', 'Maccabi Haifa', 'Beitar Jerusalem', 'Hapoel Tel Aviv', 'Bnei Yehuda', 'Maccabi Petah Tikva', 'Hapoel Haifa', 'Hapoel Ramat Gan'], tier: 3 },
  { name: 'Eyal Meshumar',      team: 'Maccabi Haifa',     playedAt: ['Hapoel Kfar Saba', 'Maccabi Haifa', 'Hapoel Tel Aviv'], tier: 3 },
  { name: 'Eyal Golasa',        team: 'Maccabi Haifa',     playedAt: ['Maccabi Haifa', 'Maccabi Tel Aviv', 'Maccabi Petah Tikva'], tier: 3 },
  { name: 'Shlomi Arbeitman',   team: 'Maccabi Haifa',     playedAt: ['Beitar Jerusalem', 'Hapoel Petah Tikva', 'Maccabi Haifa', 'Hapoel Tel Aviv', 'Hapoel Beer Sheva', 'Hapoel Haifa', 'Maccabi Petah Tikva'], tier: 3 },
  { name: 'Shalom Tikva',       team: 'Hapoel Tel Aviv',   playedAt: ['Maccabi Netanya', 'Hapoel Tel Aviv'], tier: 3 },
  { name: 'Eli Cohen',          team: 'Maccabi Haifa',     playedAt: ['Maccabi Haifa'], tier: 3 },
  { name: 'Maharan Radi',       team: 'Maccabi Tel Aviv',  playedAt: ['Bnei Yehuda', 'Bnei Sakhnin', 'Maccabi Tel Aviv', 'Hapoel Beer Sheva'], tier: 3 },
  { name: 'Yochanan Vollach',   team: 'Maccabi Haifa',     playedAt: ['Hapoel Haifa', 'Maccabi Haifa', 'Hapoel Beer Sheva', 'Maccabi Tel Aviv'], tier: 3 },
  { name: 'Mohammad Abu Fani',  team: 'Maccabi Haifa',     playedAt: ['Maccabi Haifa', 'Hapoel Ramat Gan'], tier: 3 },
  { name: 'Eden Karzev',        team: 'Maccabi Tel Aviv',  playedAt: ['Maccabi Tel Aviv', 'Ironi Kiryat Shmona', 'Maccabi Netanya'], tier: 3 },
  { name: 'Mahmoud Jaber',      team: 'Maccabi Haifa',     playedAt: ['Maccabi Haifa'], tier: 3 },
  { name: 'Yonatan Cohen',      team: 'Maccabi Tel Aviv',  playedAt: ['Maccabi Tel Aviv', 'Bnei Yehuda', 'Hapoel Petah Tikva'], tier: 3 },
  { name: 'Eylon Almog',        team: 'Hapoel Beer Sheva', playedAt: ['Maccabi Tel Aviv', 'Hapoel Beer Sheva'], tier: 3 },
  { name: 'Gai Assulin',        team: 'Hapoel Tel Aviv',   playedAt: ['Hapoel Tel Aviv'], tier: 3 },
  { name: 'Roi Kahat',          team: 'Hapoel Beer Sheva', playedAt: ['Maccabi Tel Aviv', 'Hapoel Beer Sheva', 'Ironi Kiryat Shmona', 'Maccabi Haifa', 'Maccabi Netanya'], tier: 3 },
  { name: 'Yossi Mizrahi',      team: 'Beitar Jerusalem',  playedAt: ['Beitar Jerusalem'], tier: 3 },
  { name: 'Eli Mahpud',         team: 'Hapoel Petah Tikva', playedAt: ['Hapoel Petah Tikva'], tier: 3 },
  { name: 'Itzhak Englander',   team: 'Maccabi Haifa',     playedAt: ['Hapoel Haifa', 'Maccabi Haifa'], tier: 3 },
  { name: 'Sun Menahem',        team: 'Maccabi Haifa',     playedAt: ['Maccabi Haifa', 'Ironi Kiryat Shmona'], tier: 3 },
  { name: 'Sagiv Jehezkel',     team: 'Hapoel Tel Aviv',   playedAt: ['Hapoel Tel Aviv', 'Maccabi Tel Aviv', 'Ironi Kiryat Shmona', 'Bnei Yehuda', 'Hapoel Beer Sheva'], tier: 3 },
  { name: 'Almog Cohen',        team: 'Maccabi Netanya',   playedAt: ['Maccabi Netanya', 'Hapoel Tel Aviv', 'Beitar Jerusalem'], tier: 3 },
  { name: 'Amir Schelach',      team: 'Beitar Jerusalem',  playedAt: ['Maccabi Tel Aviv', 'Beitar Jerusalem', 'Hapoel Haifa', 'Maccabi Netanya'], tier: 3 },
  { name: 'Rifaat Turk',        team: 'Hapoel Tel Aviv',   playedAt: ['Hapoel Tel Aviv'], tier: 3 },

  // ─────────────── Tier 3 — historical / deeper cuts (older era) ──────────
  { name: 'Menachem Bello',     team: 'Maccabi Tel Aviv',  playedAt: ['Maccabi Tel Aviv'], tier: 3 },
  { name: 'Rachamim Talbi',     team: 'Maccabi Tel Aviv',  playedAt: ['Maccabi Tel Aviv'], tier: 3 },
  { name: 'Zvi Rosen',          team: 'Maccabi Tel Aviv',  playedAt: ['Maccabi Tel Aviv'], tier: 3 },
  { name: 'Meir Nimni',         team: 'Maccabi Tel Aviv',  playedAt: ['Maccabi Tel Aviv'], tier: 3 },
  { name: 'Yosef Goldstein',    team: 'Maccabi Tel Aviv',  playedAt: ['Maccabi Tel Aviv'], tier: 3 },
  { name: 'Yehoshua Glazer',    team: 'Maccabi Tel Aviv',  playedAt: ['Maccabi Tel Aviv', 'Hapoel Kfar Saba', 'Beitar Jerusalem'], tier: 3 },
  { name: 'Moshe Schweitzer',   team: 'Maccabi Tel Aviv',  playedAt: ['Maccabi Tel Aviv', 'Hapoel Petah Tikva', 'Hapoel Ramat Gan'], tier: 3 },
  { name: 'Amatzia Levkovich',  team: 'Hapoel Tel Aviv',   playedAt: ['Hapoel Tel Aviv'], tier: 3 },
  { name: 'Gideon Tish',        team: 'Hapoel Tel Aviv',   playedAt: ['Hapoel Tel Aviv'], tier: 3 },
  { name: 'George Borba',       team: 'Hapoel Tel Aviv',   playedAt: ['Hapoel Tel Aviv', 'Hapoel Ramat Gan', 'Maccabi Netanya'], tier: 3 },
  { name: 'Roby Young',         team: 'Hapoel Haifa',      playedAt: ['Hapoel Haifa'], tier: 3 },
  { name: 'Avraham Menchel',    team: 'Maccabi Haifa',     playedAt: ['Maccabi Haifa'], tier: 3 },
  { name: 'Danny Shmulevich-Rom', team: 'Maccabi Haifa',   playedAt: ['Maccabi Haifa'], tier: 3 },
  { name: 'Haim Bar',           team: 'Maccabi Netanya',   playedAt: ['Maccabi Netanya'], tier: 3 },
  { name: 'Moshe Glam',         team: 'Maccabi Netanya',   playedAt: ['Maccabi Netanya', 'Maccabi Haifa', 'Maccabi Tel Aviv'], tier: 3 },
  { name: 'Shraga Bar',         team: 'Maccabi Netanya',   playedAt: ['Maccabi Netanya', 'Hapoel Ramat Gan'], tier: 3 },
  { name: 'Ran Ben Shimon',     team: 'Hapoel Haifa',      playedAt: ['Maccabi Petah Tikva', 'Hapoel Haifa', 'Hapoel Petah Tikva', 'Bnei Yehuda'], tier: 3 },
  { name: 'David Amsalem',      team: 'Beitar Jerusalem',  playedAt: ['Bnei Yehuda', 'Hapoel Tel Aviv', 'Beitar Jerusalem', 'Hapoel Haifa'], tier: 3 },
];

export const soccerPlayers: SoccerPlayer[] = records.map(r => ({
  name: r.name,
  team: r.team,
  otherTeams: buildOtherTeams(r.playedAt),
  tier: r.tier,
}));
