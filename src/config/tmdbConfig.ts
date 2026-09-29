export const TMDB_CONFIG = {
  POPULAR_LANGUAGE_CODES: ['en', 'hi', 'ta', 'te', 'ml', 'kn', 'mr', 'bn', 'ko', 'ja'],
  studios: [
    { id: 2, name: 'Walt Disney Pictures' },
    { id: 420, name: 'Marvel Studios' },
    { id: 174, name: 'Warner Bros. Pictures' },
    { id: 4, name: 'Paramount Pictures' },
    { id: 33, name: 'Universal Pictures' },
    { id: 5, name: 'Columbia Pictures' },
    { id: 1, name: 'Lucasfilm' },
    { id: 41077, name: 'A24' },
    { id: 3, name: 'Pixar' },
    { id: 521, name: 'DreamWorks Animation' }
  ],
  networks: [
    { id: 213, name: 'Netflix' },
    { id: 1024, name: 'Amazon' },
    { id: 2739, name: 'Disney+' },
    { id: 453, name: 'Hulu' },
    { id: 2552, name: 'Apple TV+' },
    { id: 49, name: 'HBO' },
    { id: 67, name: 'Showtime' },
    { id: 71, name: 'The CW' },
    { id: 6, name: 'ABC' },
    { id: 19, name: 'FOX' }
  ],
  POPULAR_THEMES: [] as any[]
};

export interface ThemeDefinition {
  id: string;
  name: string;
  query: string;
  aliases?: string[];
  movieParams?: Record<string, any>;
  tvParams?: Record<string, any>;
}

export const THEME_DEFINITIONS: ThemeDefinition[] = [
  {
    id: 'blockbuster',
    name: 'Blockbusters',
    query: 'blockbuster',
    aliases: ['blockbuster', 'blockbusters', 'mega hit', 'box office', 'hit movies'],
    movieParams: { sort_by: 'popularity.desc', 'vote_count.gte': 2500 },
    tvParams: { sort_by: 'popularity.desc', 'vote_count.gte': 1000 }
  },
  {
    id: 'anime',
    name: 'Anime',
    query: 'anime',
    aliases: ['anime', 'manga', 'japanese animation', 'otaku', 'anime movie', 'anime show'],
    movieParams: { with_genres: '16', with_original_language: 'ja', 'vote_count.gte': 40, sort_by: 'popularity.desc' },
    tvParams: { with_genres: '16', with_original_language: 'ja', 'vote_count.gte': 40, sort_by: 'popularity.desc' }
  },
  {
    id: 'superhero',
    name: 'Superheroes',
    query: 'superhero',
    aliases: ['superhero', 'superheroes', 'marvel', 'dc', 'avengers', 'justice league', 'comic book', 'super hero'],
    movieParams: { with_genres: '28,878', with_keywords: '9715|180547|849|209033', 'vote_count.gte': 400, sort_by: 'popularity.desc' },
    tvParams: { with_genres: '10759,10765', with_keywords: '9715|180547|849', 'vote_count.gte': 100, sort_by: 'popularity.desc' }
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    query: 'cyberpunk',
    aliases: ['cyberpunk', 'cyber punk', 'dystopian', 'dystopia', 'cyborg', 'futuristic'],
    movieParams: { with_genres: '878', with_keywords: '12190|158718|4565', 'vote_count.gte': 80, sort_by: 'popularity.desc' },
    tvParams: { with_genres: '10765', with_keywords: '12190|158718|4565', 'vote_count.gte': 30, sort_by: 'popularity.desc' }
  },
  {
    id: 'mind-bending',
    name: 'Mind-Bending',
    query: 'mind bending',
    aliases: ['mind bending', 'mind-bending', 'psychological thriller', 'plot twist', 'mind twist', 'surreal'],
    movieParams: { with_genres: '9648,53', with_keywords: '9717|362567', 'vote_count.gte': 150, sort_by: 'popularity.desc' },
    tvParams: { with_genres: '9648,18', with_keywords: '9717', 'vote_count.gte': 80, sort_by: 'popularity.desc' }
  },
  {
    id: 'heist',
    name: 'Heist',
    query: 'heist',
    aliases: ['heist', 'heists', 'robbery', 'bank robbery', 'caper', 'theft'],
    movieParams: { with_genres: '80,53', with_keywords: '10051|191845', 'vote_count.gte': 100, sort_by: 'popularity.desc' },
    tvParams: { with_genres: '80', with_keywords: '10051', 'vote_count.gte': 40, sort_by: 'popularity.desc' }
  },
  {
    id: 'time-travel',
    name: 'Time Travel',
    query: 'time travel',
    aliases: ['time travel', 'time-travel', 'timetravel', 'time loop', 'temporal', 'time machine'],
    movieParams: { with_keywords: '4379', 'vote_count.gte': 100, sort_by: 'popularity.desc' },
    tvParams: { with_keywords: '4379', 'vote_count.gte': 40, sort_by: 'popularity.desc' }
  },
  {
    id: 'space-odyssey',
    name: 'Space Odyssey',
    query: 'space',
    aliases: ['space', 'space odyssey', 'outer space', 'astronaut', 'galaxy', 'interstellar travel', 'cosmos'],
    movieParams: { with_genres: '878', with_keywords: '9882|3801', 'vote_count.gte': 150, sort_by: 'popularity.desc' },
    tvParams: { with_genres: '10765', with_keywords: '9882|3801', 'vote_count.gte': 50, sort_by: 'popularity.desc' }
  },
  {
    id: 'survival',
    name: 'Survival',
    query: 'survival',
    aliases: ['survival', 'survive', 'stranded', 'wilderness', 'castaway', 'apocalypse survival'],
    movieParams: { with_keywords: '10349|50009', 'vote_count.gte': 100, sort_by: 'popularity.desc' },
    tvParams: { with_keywords: '10349|50009', 'vote_count.gte': 40, sort_by: 'popularity.desc' }
  },
  {
    id: 'zombie',
    name: 'Zombie Apocalypse',
    query: 'zombie',
    aliases: ['zombie', 'zombies', 'undead', 'walkers', 'infected', 'living dead'],
    movieParams: { with_keywords: '12377|186565', 'vote_count.gte': 100, sort_by: 'popularity.desc' },
    tvParams: { with_keywords: '12377|186565', 'vote_count.gte': 40, sort_by: 'popularity.desc' }
  },
  {
    id: 'mafia',
    name: 'Mob & Gangsters',
    query: 'mafia',
    aliases: ['mafia', 'gangster', 'gangsters', 'mob', 'mobster', 'cartel', 'organized crime', 'underworld'],
    movieParams: { with_keywords: '10391', 'vote_count.gte': 100, sort_by: 'popularity.desc' },
    tvParams: { with_keywords: '10391', 'vote_count.gte': 40, sort_by: 'popularity.desc' }
  },
  {
    id: 'true-story',
    name: 'True Story',
    query: 'true story',
    aliases: ['true story', 'biography', 'biopic', 'based on a true story', 'real story', 'history'],
    movieParams: { with_keywords: '5565', 'vote_count.gte': 100, sort_by: 'popularity.desc' },
    tvParams: { with_keywords: '5565', 'vote_count.gte': 40, sort_by: 'popularity.desc' }
  },
  {
    id: 'supernatural',
    name: 'Supernatural',
    query: 'supernatural',
    aliases: ['supernatural', 'paranormal', 'demons', 'ghosts', 'occult', 'haunting'],
    movieParams: { with_keywords: '6152', 'vote_count.gte': 100, sort_by: 'popularity.desc' },
    tvParams: { with_keywords: '6152', 'vote_count.gte': 40, sort_by: 'popularity.desc' }
  },
  {
    id: 'dark-thriller',
    name: 'Dark Thriller',
    query: 'dark thriller',
    aliases: ['dark thriller', 'neo noir', 'noir', 'crime thriller', 'dark crime', 'gritty thriller'],
    movieParams: { with_genres: '53,80', 'vote_count.gte': 400, sort_by: 'popularity.desc' },
    tvParams: { with_genres: '80,18', 'vote_count.gte': 200, sort_by: 'popularity.desc' }
  },
  {
    id: 'mystery',
    name: 'Mystery & Whodunit',
    query: 'mystery',
    aliases: ['mystery', 'mysteries', 'whodunit', 'detective', 'investigation', 'clue'],
    movieParams: { with_genres: '9648', 'vote_count.gte': 400, sort_by: 'popularity.desc' },
    tvParams: { with_genres: '9648', 'vote_count.gte': 150, sort_by: 'popularity.desc' }
  },
  {
    id: 'horror',
    name: 'Horror',
    query: 'horror',
    aliases: ['horror', 'scary', 'spooky', 'slasher', 'terror', 'creepy'],
    movieParams: { with_genres: '27', 'vote_count.gte': 300, sort_by: 'popularity.desc' },
    tvParams: { with_genres: '10765,9648', with_keywords: '9675', 'vote_count.gte': 100, sort_by: 'popularity.desc' }
  },
  {
    id: 'action',
    name: 'Action',
    query: 'action',
    aliases: ['action', 'martial arts', 'action thriller', 'fight', 'action movie', 'adrenaline'],
    movieParams: { with_genres: '28', 'vote_count.gte': 500, sort_by: 'popularity.desc' },
    tvParams: { with_genres: '10759', 'vote_count.gte': 200, sort_by: 'popularity.desc' }
  },
  {
    id: 'comedy',
    name: 'Comedy',
    query: 'comedy',
    aliases: ['comedy', 'comedies', 'funny', 'hilarious', 'sitcom'],
    movieParams: { with_genres: '35', 'vote_count.gte': 400, sort_by: 'popularity.desc' },
    tvParams: { with_genres: '35', 'vote_count.gte': 200, sort_by: 'popularity.desc' }
  },
  {
    id: 'romance',
    name: 'Romance',
    query: 'romance',
    aliases: ['romance', 'romantic', 'love story', 'rom-com', 'romcom'],
    movieParams: { with_genres: '10749', 'vote_count.gte': 300, sort_by: 'popularity.desc' },
    tvParams: { with_genres: '18', with_keywords: '9840', 'vote_count.gte': 100, sort_by: 'popularity.desc' }
  },
  {
    id: 'sci-fi',
    name: 'Sci-Fi',
    query: 'sci-fi',
    aliases: ['sci-fi', 'scifi', 'sci fi', 'science fiction', 'futuristic sci-fi'],
    movieParams: { with_genres: '878', 'vote_count.gte': 400, sort_by: 'popularity.desc' },
    tvParams: { with_genres: '10765', 'vote_count.gte': 150, sort_by: 'popularity.desc' }
  }
];

TMDB_CONFIG.POPULAR_THEMES = THEME_DEFINITIONS;

export const findThemeMatch = (query: string): ThemeDefinition | undefined => {
  if (!query) return undefined;
  const norm = query
    .toLowerCase()
    .trim()
    .replace(/^#/, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!norm) return undefined;

  return THEME_DEFINITIONS.find(t => {
    if (t.id === norm) return true;
    if (t.name.toLowerCase() === norm) return true;
    if (t.query.toLowerCase() === norm) return true;
    if (t.aliases?.some(a => a.toLowerCase() === norm)) return true;
    if (t.aliases?.some(a => norm === `${a.toLowerCase()} movies` || norm === `${a.toLowerCase()} shows` || norm === `${a.toLowerCase()} series`)) return true;
    return false;
  });
};
