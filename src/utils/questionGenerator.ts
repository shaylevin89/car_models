import {
  CarBrand,
  CarsQuestion,
  CountriesQuestion,
  Country,
  DifficultyTier,
  Flag,
  FlagsQuestion,
  Question,
  Subject,
} from '../types/game';
import { carBrands } from '../data/carData';
import { countries } from '../data/countryData';
import { flags } from '../data/flagData';

/**
 * Determines the tier for a given score using cyclic assignment:
 * Scores 0-9: Tier 1, 10-19: Tier 2, 20-29: Tier 3, 30-39: Tier 1, ...
 */
export function getTierForScore(score: number): DifficultyTier {
  const cycle = Math.floor(score / 10) % 3;
  return (cycle + 1) as DifficultyTier;
}

/**
 * Returns brands from the tier that matches the given score's cycle position.
 */
export function getBrandsForScore(score: number): CarBrand[] {
  const tier = getTierForScore(score);
  return carBrands.filter(b => b.tier === tier);
}

/**
 * Returns countries from the tier that matches the given score's cycle position.
 */
export function getCountriesForScore(score: number): Country[] {
  const tier = getTierForScore(score);
  return countries.filter(c => c.tier === tier);
}

/**
 * Returns flags from the tier that matches the given score's cycle position.
 */
export function getFlagsForScore(score: number): Flag[] {
  const tier = getTierForScore(score);
  return flags.filter(f => f.tier === tier);
}

/**
 * Shuffles an array using Fisher-Yates. Returns a new array.
 */
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Picks N unique distractors from `pool` that are not equal to `correct`.
 * Assumes pool has enough distinct values.
 */
function pickDistractors(pool: string[], correct: string, n: number): string[] {
  const shuffled = shuffle(pool);
  const picked: string[] = [];
  const used = new Set<string>([correct]);
  for (const value of shuffled) {
    if (!used.has(value) && picked.length < n) {
      picked.push(value);
      used.add(value);
    }
  }
  return picked;
}

function generateCarsQuestion(score: number, excludeKeys: string[] = []): CarsQuestion {
  const tierBrands = getBrandsForScore(score);
  // Avoid recently-used brands. Fall back to the full tier if the filter empties the pool.
  const excluded = new Set(excludeKeys);
  const filtered = tierBrands.filter(b => !excluded.has(b.name));
  const available = filtered.length > 0 ? filtered : tierBrands;

  const brand = available[Math.floor(Math.random() * available.length)];
  const correctAnswer = brand.models[Math.floor(Math.random() * brand.models.length)];

  // Distractors are drawn from the full tier (not the filtered set) so the wrong
  // answers stay diverse even when the recent-list narrows the brand pool.
  const distractorPool = tierBrands
    .filter(b => b.name !== brand.name)
    .flatMap(b => b.models);
  const distractors = pickDistractors(distractorPool, correctAnswer, 3);
  const options = shuffle([correctAnswer, ...distractors]);

  return { subject: 'cars', brand, correctAnswer, options };
}

function generateCountriesQuestion(score: number, excludeKeys: string[] = []): CountriesQuestion {
  const tierCountries = getCountriesForScore(score);
  const excluded = new Set(excludeKeys);
  const filtered = tierCountries.filter(c => !excluded.has(c.name));
  const available = filtered.length > 0 ? filtered : tierCountries;

  const country = available[Math.floor(Math.random() * available.length)];
  const correctAnswer = country.capital;

  const distractors = pickDistractors(country.otherCities, correctAnswer, 3);
  const options = shuffle([correctAnswer, ...distractors]);

  return { subject: 'countries', country, correctAnswer, options };
}

function generateFlagsQuestion(score: number, excludeKeys: string[] = []): FlagsQuestion {
  const tierFlags = getFlagsForScore(score);
  const excluded = new Set(excludeKeys);
  const filtered = tierFlags.filter(f => !excluded.has(f.name));
  const available = filtered.length > 0 ? filtered : tierFlags;

  const flag = available[Math.floor(Math.random() * available.length)];
  const correctAnswer = flag.name;

  // Distractors are other country names from the same tier so options stay
  // in the same difficulty band as the correct answer.
  const distractorPool = tierFlags.filter(f => f.name !== flag.name).map(f => f.name);
  const distractors = pickDistractors(distractorPool, correctAnswer, 3);
  const options = shuffle([correctAnswer, ...distractors]);

  return { subject: 'flags', flag, correctAnswer, options };
}

/**
 * Generates a trivia question for the given subject at the given score level.
 * Picks a random item from the current tier, selects a correct answer,
 * and fills 3 distractor answers from other items in the same tier.
 *
 * `excludeKeys` is a list of recently-asked brand names (cars), country names
 * (countries), or flag country names (flags) that should be skipped, to
 * prevent repeats in close succession.
 */
export function generateQuestion(
  subject: Subject,
  score: number,
  excludeKeys: string[] = [],
): Question {
  switch (subject) {
    case 'cars':
      return generateCarsQuestion(score, excludeKeys);
    case 'countries':
      return generateCountriesQuestion(score, excludeKeys);
    case 'flags':
      return generateFlagsQuestion(score, excludeKeys);
  }
}

/**
 * Returns the identifier used to track a question in the recent-questions list:
 * brand name for car questions, country name for country & flag questions.
 */
export function getQuestionKey(question: Question): string {
  switch (question.subject) {
    case 'cars':
      return question.brand.name;
    case 'countries':
      return question.country.name;
    case 'flags':
      return question.flag.name;
  }
}
