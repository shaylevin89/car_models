import {
  CarBrand,
  CarsQuestion,
  CountriesQuestion,
  Country,
  DifficultyTier,
  Question,
  Subject,
} from '../types/game';
import { carBrands } from '../data/carData';
import { countries } from '../data/countryData';

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

function generateCarsQuestion(score: number): CarsQuestion {
  const available = getBrandsForScore(score);
  const brand = available[Math.floor(Math.random() * available.length)];
  const correctAnswer = brand.models[Math.floor(Math.random() * brand.models.length)];

  const distractorPool = available
    .filter(b => b.name !== brand.name)
    .flatMap(b => b.models);
  const distractors = pickDistractors(distractorPool, correctAnswer, 3);
  const options = shuffle([correctAnswer, ...distractors]);

  return { subject: 'cars', brand, correctAnswer, options };
}

function generateCountriesQuestion(score: number): CountriesQuestion {
  const available = getCountriesForScore(score);
  const country = available[Math.floor(Math.random() * available.length)];
  const correctAnswer = country.capital;

  const distractors = pickDistractors(country.otherCities, correctAnswer, 3);
  const options = shuffle([correctAnswer, ...distractors]);

  return { subject: 'countries', country, correctAnswer, options };
}

/**
 * Generates a trivia question for the given subject at the given score level.
 * Picks a random item from the current tier, selects a correct answer,
 * and fills 3 distractor answers from other items in the same tier.
 */
export function generateQuestion(subject: Subject, score: number): Question {
  return subject === 'cars'
    ? generateCarsQuestion(score)
    : generateCountriesQuestion(score);
}
